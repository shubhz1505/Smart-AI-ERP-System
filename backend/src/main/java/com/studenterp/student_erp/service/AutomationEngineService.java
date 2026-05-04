package com.studenterp.student_erp.service;

import com.studenterp.student_erp.entity.*;
import com.studenterp.student_erp.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AutomationEngineService {

    private final PythonAiClient aiClient;
    private final FeeRepository feeRepository;
    private final StudentRepository studentRepository;
    private final AttendanceRepository attendanceRepository;
    private final AiPredictionRepository aiPredictionRepository;
    private final AutomationActionRepository automationActionRepository;
    private final StudentQueryRepository studentQueryRepository;

    // ================================================
    // FEE AUTOMATION — called by scheduler daily
    // ================================================
    public Map<String, Object> runFeeAutomation() {
        log.info("🤖 Starting Fee Automation Engine...");

        List<Fee> pendingFees = feeRepository.findByPaymentStatus(Fee.PaymentStatus.pending);
        int remindersScheduled = 0;
        int highRiskCount = 0;
        List<Map<String, Object>> results = new ArrayList<>();

        for (Fee fee : pendingFees) {
            try {
                Student student = studentRepository.findById(fee.getStudentId()).orElse(null);
                if (student == null) continue;

                // Get attendance data
                var attendanceList = attendanceRepository.findByStudentId(student.getId());
                long total = attendanceList.size();
                long present = attendanceList.stream()
                        .filter(a -> a.getStatus() == Attendance.AttendanceStatus.present)
                        .count();
                double attendancePct = total > 0 ? (present * 100.0 / total) : 75.0;

                // Calculate days since due date
                BigDecimal pendingAmount = fee.getTotalAmount().subtract(fee.getPaidAmount());
                int daysSince = fee.getDueDate() != null ?
                        (int) java.time.temporal.ChronoUnit.DAYS.between(
                                fee.getDueDate(), java.time.LocalDate.now()) : 30;
                daysSince = Math.max(0, daysSince);

                // Call Python AI service
                Map<String, Object> prediction = aiClient.predictFeeDefaulter(
                        student.getId(),
                        attendancePct,
                        pendingAmount.doubleValue(),
                        daysSince,
                        0,
                        fee.getSemester() != null ? fee.getSemester() : 1
                );

                // ── Calculate risk from REAL data ──────────────────────
                double calculatedRiskScore = calculateFeeRiskScore(
                        pendingAmount.doubleValue(), daysSince, attendancePct);
                String calculatedRiskLevel = getRiskLevel(calculatedRiskScore);

                // Override Python result with calculated risk if Python returns 0
                double finalRiskScore = calculatedRiskScore;
                String finalRiskLevel = calculatedRiskLevel;

                // If Python returned meaningful data, use it
                double pythonScore = ((Number) prediction.getOrDefault("riskScore", 0.0)).doubleValue();
                if (pythonScore > 0) {
                    finalRiskScore = pythonScore;
                    finalRiskLevel = getRiskLevel(finalRiskScore);
                }

                // Save prediction with correct risk
                savePredictionWithRisk(student.getId(), "FEE_DEFAULTER",
                        prediction, finalRiskScore, finalRiskLevel);

                // Decision Engine
                String action = decideAndActOnFeeRisk(
                        student, fee, finalRiskLevel, finalRiskScore, pendingAmount);

                if (!action.equals("NO_ACTION")) remindersScheduled++;
                if (finalRiskLevel.equals("HIGH")) highRiskCount++;

                results.add(Map.of(
                        "studentId", student.getId(),
                        "studentName", student.getFirstName() + " " + student.getLastName(),
                        "riskLevel", finalRiskLevel,
                        "riskScore", finalRiskScore,
                        "action", action
                ));

            } catch (Exception e) {
                log.error("Error processing fee automation for fee {}: {}",
                        fee.getId(), e.getMessage());
            }
        }

        log.info("✅ Fee Automation complete: {} processed, {} reminders, {} high risk",
                pendingFees.size(), remindersScheduled, highRiskCount);

        return Map.of(
                "totalProcessed", pendingFees.size(),
                "remindersScheduled", remindersScheduled,
                "highRiskCount", highRiskCount,
                "results", results
        );
    }

    // ── Calculate fee risk from real data ─────────────────────────────────────
    private double calculateFeeRiskScore(double pendingAmount, int daysSince, double attendancePct) {
        double risk = 0.0;

        // Days overdue contributes most to risk
        if (daysSince >= 60) risk += 0.5;
        else if (daysSince >= 30) risk += 0.35;
        else if (daysSince >= 15) risk += 0.2;
        else risk += 0.05;

        // Pending amount
        if (pendingAmount >= 30000) risk += 0.3;
        else if (pendingAmount >= 10000) risk += 0.2;
        else if (pendingAmount > 0) risk += 0.1;

        // Low attendance = higher default risk
        if (attendancePct < 60) risk += 0.2;
        else if (attendancePct < 75) risk += 0.1;

        return Math.min(risk, 1.0);
    }

    private String decideAndActOnFeeRisk(
            Student student, Fee fee,
            String riskLevel, double riskScore,
            BigDecimal pendingAmount) {

        String action = "NO_ACTION";
        String message = null;

        if (riskLevel.equals("HIGH") || riskScore >= 0.7) {
            message = String.format(
                    "URGENT: Dear %s, your fee of ₹%.0f is overdue. " +
                            "Please pay immediately to avoid penalties.",
                    student.getFirstName(), pendingAmount.doubleValue());
            action = "URGENT_REMINDER_SENT";

        } else if (riskLevel.equals("MEDIUM") || riskScore >= 0.5) {
            message = String.format(
                    "Dear %s, your fee of ₹%.0f is pending. " +
                            "Please pay before the due date.",
                    student.getFirstName(), pendingAmount.doubleValue());
            action = "NORMAL_REMINDER_SENT";
        }

        if (message != null) {
            saveActionLog(
                    student.getId(),
                    action,
                    "Risk Score: " + String.format("%.2f", riskScore) + " | Level: " + riskLevel,
                    message
            );
            log.info("📨 {} for student {} (risk: {})", action, student.getId(), riskLevel);
        }

        return action;
    }

    // ================================================
    // ATTENDANCE AUTOMATION
    // ================================================
    @Transactional
    public void saveActionLog(Long studentId, String actionType,
                              String triggerReason, String message) {
        AutomationAction action = AutomationAction.builder()
                .studentId(studentId)
                .actionType(actionType)
                .triggerReason(triggerReason)
                .messageSent(message)
                .status("completed")
                .build();
        automationActionRepository.save(action);
    }

    public Map<String, Object> runAttendanceAutomation() {
        log.info("🤖 Starting Attendance Automation Engine...");

        List<Student> students = studentRepository.findByStatus(Student.Status.active);
        int warningsSent = 0;
        int parentNotifications = 0;
        int adminFlags = 0;

        for (Student student : students) {
            try {
                var attendanceList = attendanceRepository.findByStudentId(student.getId());
                if (attendanceList.isEmpty()) continue;

                long total = attendanceList.size();
                long present = attendanceList.stream()
                        .filter(a -> a.getStatus() == Attendance.AttendanceStatus.present)
                        .count();
                double percentage = (present * 100.0 / total);

                int consecutive = countConsecutiveAbsences(student.getId());
                int mondayAbsences = countMondayAbsences(student.getId());

                // Call Python AI service
                Map<String, Object> prediction = aiClient.detectAttendanceAnomaly(
                        student.getId(),
                        percentage,
                        consecutive,
                        mondayAbsences,
                        (int) total,
                        (int) present
                );

                // ── Calculate attendance risk from REAL data ──────────
                double calculatedRiskScore = calculateAttendanceRiskScore(
                        percentage, consecutive);
                String calculatedRiskLevel = getRiskLevel(calculatedRiskScore);

                // Use Python if meaningful, else use calculated
                double pythonScore = ((Number) prediction.getOrDefault(
                        "riskScore", 0.0)).doubleValue();
                double finalRiskScore = pythonScore > 0 ? pythonScore : calculatedRiskScore;
                String finalRiskLevel = getRiskLevel(finalRiskScore);

                // Save prediction with correct risk
                savePredictionWithRisk(student.getId(), "ATTENDANCE_ANOMALY",
                        prediction, finalRiskScore, finalRiskLevel);

                String anomalyType = (String) prediction.getOrDefault("anomalyType", "NORMAL");

                // Determine anomaly from calculated risk if Python returns NORMAL
                if (anomalyType.equals("NORMAL") && percentage < 75) {
                    if (percentage < 60) anomalyType = "CRITICAL_LOW_ATTENDANCE";
                    else anomalyType = "LOW_ATTENDANCE";
                }

                boolean notifyParent = (Boolean) prediction.getOrDefault("notifyParent", false);
                boolean flagAdmin = (Boolean) prediction.getOrDefault("flagAdmin", false);

                if (!anomalyType.equals("NORMAL")) {
                    String message = buildAttendanceMessage(student, percentage, anomalyType);
                    AutomationAction action = AutomationAction.builder()
                            .studentId(student.getId())
                            .actionType("ATTENDANCE_WARNING")
                            .triggerReason(anomalyType + " | " + String.format("%.1f", percentage) + "%")
                            .messageSent(message)
                            .status("completed")
                            .build();
                    automationActionRepository.save(action);
                    warningsSent++;
                }

                if (notifyParent) parentNotifications++;
                if (flagAdmin) adminFlags++;

            } catch (Exception e) {
                log.error("Error in attendance automation for student {}: {}",
                        student.getId(), e.getMessage());
            }
        }

        log.info("✅ Attendance Automation: {} warnings, {} parent notifications, {} admin flags",
                warningsSent, parentNotifications, adminFlags);

        return Map.of(
                "totalStudents", students.size(),
                "warningsSent", warningsSent,
                "parentNotifications", parentNotifications,
                "adminFlags", adminFlags
        );
    }

    // ── Calculate attendance risk from real data ──────────────────────────────
    private double calculateAttendanceRiskScore(double percentage, int consecutive) {
        double risk = 0.0;

        if (percentage < 60) risk += 0.6;
        else if (percentage < 70) risk += 0.45;
        else if (percentage < 75) risk += 0.3;
        else if (percentage < 85) risk += 0.1;
        else risk += 0.0;

        if (consecutive >= 5) risk += 0.3;
        else if (consecutive >= 3) risk += 0.2;
        else if (consecutive >= 2) risk += 0.1;

        return Math.min(risk, 1.0);
    }

    private String buildAttendanceMessage(
            Student student, double percentage, String anomalyType) {
        return switch (anomalyType) {
            case "CRITICAL_LOW_ATTENDANCE" ->
                    String.format("URGENT: %s has only %.1f%% attendance. Immediate action required.",
                            student.getFirstName(), percentage);
            case "LOW_ATTENDANCE" ->
                    String.format("Warning: %s has %.1f%% attendance. Minimum required is 75%%.",
                            student.getFirstName(), percentage);
            case "CONSECUTIVE_ABSENCES" ->
                    String.format("%s has been absent consecutively. Please check on the student.",
                            student.getFirstName());
            case "SUSPICIOUS_PATTERN" ->
                    String.format("Suspicious attendance pattern detected for %s.",
                            student.getFirstName());
            default -> "Attendance anomaly detected for " + student.getFirstName();
        };
    }

    private int countConsecutiveAbsences(Long studentId) {
        var records = attendanceRepository.findByStudentId(studentId);
        records.sort((a, b) -> b.getDate().compareTo(a.getDate()));
        int count = 0;
        for (var record : records) {
            if (record.getStatus() == Attendance.AttendanceStatus.absent) count++;
            else break;
        }
        return count;
    }

    private int countMondayAbsences(Long studentId) {
        return (int) attendanceRepository.findByStudentId(studentId).stream()
                .filter(a -> a.getDate().getDayOfWeek() == java.time.DayOfWeek.MONDAY
                        && a.getStatus() == Attendance.AttendanceStatus.absent)
                .count();
    }

    // ================================================
    // QUERY HANDLER
    // ================================================
    @Transactional
    public Map<String, Object> handleStudentQuery(Long studentId, String question) {
        log.info("💬 Handling query from student {}: {}", studentId, question);

        Map<String, Object> classification = aiClient.classifyQuery(studentId, question);

        String intent = (String) classification.getOrDefault("intent", "GENERAL_QUERY");
        double confidence = ((Number) classification.getOrDefault("confidence", 0.0)).doubleValue();
        boolean autoAnswer = (Boolean) classification.getOrDefault("autoAnswer", false);
        boolean escalate = (Boolean) classification.getOrDefault("escalateToAdmin", false);

        String response;
        String template = (String) classification.getOrDefault("template", "");

        if (autoAnswer && !escalate) {
            response = buildSmartResponse(studentId, intent, template);
        } else {
            response = "Your query has been forwarded to our admin team. " +
                    "They will respond within 24 hours.";
        }

        StudentQuery query = StudentQuery.builder()
                .studentId(studentId)
                .question(question)
                .intent(intent)
                .confidence(BigDecimal.valueOf(confidence))
                .autoAnswered(autoAnswer)
                .response(response)
                .escalatedToAdmin(escalate)
                .build();
        studentQueryRepository.save(query);

        return Map.of(
                "studentId", studentId,
                "question", question,
                "intent", intent,
                "confidence", confidence,
                "response", response,
                "autoAnswered", autoAnswer,
                "escalatedToAdmin", escalate
        );
    }

    private String buildSmartResponse(Long studentId, String intent, String template) {
        try {
            return switch (intent) {
                case "ATTENDANCE_QUERY" -> {
                    var records = attendanceRepository.findByStudentId(studentId);
                    long total = records.size();
                    long present = records.stream()
                            .filter(a -> a.getStatus() == Attendance.AttendanceStatus.present)
                            .count();
                    double pct = total > 0 ?
                            Math.round(present * 100.0 / total * 10) / 10.0 : 0;
                    String status = pct >= 75 ? "Safe ✅" : "At Risk ⚠️";
                    yield String.format(
                            "Your current attendance is %.1f%%. " +
                                    "You attended %d out of %d classes. Status: %s",
                            pct, present, total, status);
                }
                case "FEE_QUERY" -> {
                    var fees = feeRepository.findByStudentId(studentId);
                    BigDecimal total = fees.stream()
                            .map(Fee::getTotalAmount)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                    BigDecimal paid = fees.stream()
                            .map(Fee::getPaidAmount)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                    BigDecimal due = total.subtract(paid);
                    yield String.format(
                            "Your fee details: Total ₹%.0f | Paid ₹%.0f | Due ₹%.0f",
                            total.doubleValue(), paid.doubleValue(), due.doubleValue());
                }
                case "EXAM_QUERY" ->
                        "Exam schedule and predictions are available in your student dashboard. " +
                                "Please check the Exam section for details.";
                case "CERTIFICATE_REQUEST" ->
                        "Certificate requests are processed within 2-3 working days. " +
                                "Please visit the admin office with your ID card.";
                default ->
                        "Thank you for your query. Please visit the admin office for assistance.";
            };
        } catch (Exception e) {
            return "I am unable to fetch your data right now. Please try again later.";
        }
    }

    // ================================================
    // HELPER: Save prediction with CORRECT risk
    // ================================================

    // ── OLD savePrediction replaced — now uses calculated risk ────────────────
    private void savePrediction(Long studentId, String serviceType,
                                Map<String, Object> result) {
        // Get score from Python
        double score = ((Number) result.getOrDefault("predictedScore", 0.0)).doubleValue();
        double riskScore;
        String riskLevel;

        if (score > 0) {
            // Python returned a score — convert to risk
            riskScore = (100.0 - score) / 100.0;
            riskLevel = getRiskLevel(riskScore);
        } else {
            // Python returned 0 — use riskScore directly if available
            riskScore = ((Number) result.getOrDefault("riskScore", 0.0)).doubleValue();
            riskLevel = riskScore > 0 ? getRiskLevel(riskScore)
                    : (String) result.getOrDefault("riskLevel", "LOW");
        }

        savePredictionWithRisk(studentId, serviceType, result, riskScore, riskLevel);
    }

    // ── New method — saves with explicitly calculated risk ────────────────────
    private void savePredictionWithRisk(Long studentId, String serviceType,
                                        Map<String, Object> result,
                                        double riskScore, String riskLevel) {
        try {
            AiPrediction prediction = AiPrediction.builder()
                    .studentId(studentId)
                    .serviceType(serviceType)
                    .riskScore(BigDecimal.valueOf(riskScore))
                    .riskLevel(riskLevel)
                    .predictionResult(result.toString())
                    .build();
            aiPredictionRepository.save(prediction);
            log.info("💾 Saved prediction: student={}, type={}, score={}, level={}",
                    studentId, serviceType, riskScore, riskLevel);
        } catch (Exception e) {
            log.error("Failed to save prediction: {}", e.getMessage());
        }
    }

    // ── Convert risk score (0.0–1.0) to level ────────────────────────────────
    private String getRiskLevel(double riskScore) {
        if (riskScore >= 0.7) return "HIGH";
        if (riskScore >= 0.4) return "MEDIUM";
        return "LOW";
    }

    // ================================================
    // EXAM PREDICTION
    // ================================================
    @Transactional
    public Map<String, Object> predictStudentExam(
            Long studentId,
            double assignmentScore,
            double midtermScore,
            double quizAverage,
            double studyHours) {

        var records = attendanceRepository.findByStudentId(studentId);
        long total = records.size();
        long present = records.stream()
                .filter(a -> a.getStatus() == Attendance.AttendanceStatus.present)
                .count();
        double attendancePct = total > 0 ? (present * 100.0 / total) : 75.0;

        Map<String, Object> prediction = aiClient.predictExamPerformance(
                studentId, attendancePct, assignmentScore,
                midtermScore, quizAverage, studyHours);

        // Calculate exam risk from scores
        double avgScore = (assignmentScore + midtermScore + quizAverage) / 3.0;
        double examRiskScore = Math.max(0, (70.0 - avgScore) / 70.0);
        String examRiskLevel = getRiskLevel(examRiskScore);

        savePredictionWithRisk(studentId, "EXAM_PREDICTOR",
                prediction, examRiskScore, examRiskLevel);

        if (avgScore < 50 || attendancePct < 65) {
            AutomationAction action = AutomationAction.builder()
                    .studentId(studentId)
                    .actionType("EXAM_RISK_ALERT")
                    .triggerReason("Avg score: " + String.format("%.1f", avgScore)
                            + " | Attendance: " + String.format("%.1f", attendancePct) + "%")
                    .messageSent("Your predicted exam score is low. Please study more.")
                    .status("completed")
                    .build();
            automationActionRepository.save(action);
        }

        return prediction;
    }
}