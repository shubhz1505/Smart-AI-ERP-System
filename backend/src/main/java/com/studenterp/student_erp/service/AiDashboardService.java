package com.studenterp.service;

import com.studenterp.entity.*;
import com.studenterp.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiDashboardService {

    private final AiPredictionRepository aiPredictionRepository;
    private final AutomationActionRepository automationActionRepository;
    private final StudentQueryRepository studentQueryRepository;
    private final StudentRepository studentRepository;
    private final FeeRepository feeRepository;
    private final AttendanceRepository attendanceRepository;

    // ================================================
    // MAIN AI DASHBOARD — Admin sees everything
    // ================================================
    public Map<String, Object> getAiDashboard() {
        Map<String, Object> dashboard = new HashMap<>();

        // ── Prediction Stats ──
        long totalPredictions = aiPredictionRepository.count();
        long highRiskCount = aiPredictionRepository.countHighRiskPredictions();
        long feeDefaulterPredictions = aiPredictionRepository
                .countByServiceType("FEE_DEFAULTER");
        long attendancePredictions = aiPredictionRepository
                .countByServiceType("ATTENDANCE_ANOMALY");
        long examPredictions = aiPredictionRepository
                .countByServiceType("EXAM_PREDICTOR");

        Map<String, Object> predictionStats = new HashMap<>();
        predictionStats.put("totalPredictions", totalPredictions);
        predictionStats.put("highRiskCount", highRiskCount);
        predictionStats.put("feeDefaulterPredictions", feeDefaulterPredictions);
        predictionStats.put("attendancePredictions", attendancePredictions);
        predictionStats.put("examPredictions", examPredictions);
        dashboard.put("predictionStats", predictionStats);

        // ── Automation Stats ──
        long totalActions = automationActionRepository.count();
        long urgentReminders = automationActionRepository.countUrgentReminders();
        long attendanceWarnings = automationActionRepository.countAttendanceWarnings();
        long todayActions = automationActionRepository.countTodayActions();

        Map<String, Object> automationStats = new HashMap<>();
        automationStats.put("totalActions", totalActions);
        automationStats.put("urgentRemindersSent", urgentReminders);
        automationStats.put("attendanceWarningsSent", attendanceWarnings);
        automationStats.put("todayActions", todayActions);
        dashboard.put("automationStats", automationStats);

        // ── Chatbot Stats ──
        long totalQueries = studentQueryRepository.count();
        long autoAnswered = studentQueryRepository.countAutoAnswered();
        long escalated = studentQueryRepository.countEscalated();
        double automationRate = totalQueries > 0 ?
                Math.round((autoAnswered * 100.0 / totalQueries) * 10) / 10.0 : 0.0;

        Map<String, Object> chatbotStats = new HashMap<>();
        chatbotStats.put("totalQueries", totalQueries);
        chatbotStats.put("autoAnswered", autoAnswered);
        chatbotStats.put("escalatedToAdmin", escalated);
        chatbotStats.put("automationRate", automationRate + "%");
        dashboard.put("chatbotStats", chatbotStats);

        // ── Recent Predictions (last 10) ──
        List<Map<String, Object>> recentPredictions = aiPredictionRepository
                .findTop10ByOrderByCreatedAtDesc()
                .stream()
                .map(p -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", p.getId());
                    map.put("studentId", p.getStudentId());
                    map.put("serviceType", p.getServiceType());
                    map.put("riskScore", p.getRiskScore());
                    map.put("riskLevel", p.getRiskLevel());
                    map.put("createdAt", p.getCreatedAt());
                    return map;
                })
                .collect(Collectors.toList());
        dashboard.put("recentPredictions", recentPredictions);

        // ── Recent Actions (last 10) ──
        List<Map<String, Object>> recentActions = automationActionRepository
                .findTop10ByOrderByCreatedAtDesc()
                .stream()
                .map(a -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", a.getId());
                    map.put("studentId", a.getStudentId());
                    map.put("actionType", a.getActionType());
                    map.put("triggerReason", a.getTriggerReason());
                    map.put("status", a.getStatus());
                    map.put("createdAt", a.getCreatedAt());
                    return map;
                })
                .collect(Collectors.toList());
        dashboard.put("recentActions", recentActions);

        // ── Recent Queries (last 10) ──
        List<Map<String, Object>> recentQueries = studentQueryRepository
                .findTop10ByOrderByCreatedAtDesc()
                .stream()
                .map(q -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", q.getId());
                    map.put("studentId", q.getStudentId());
                    map.put("question", q.getQuestion());
                    map.put("intent", q.getIntent());
                    map.put("confidence", q.getConfidence());
                    map.put("autoAnswered", q.getAutoAnswered());
                    map.put("escalated", q.getEscalatedToAdmin());
                    map.put("createdAt", q.getCreatedAt());
                    return map;
                })
                .collect(Collectors.toList());
        dashboard.put("recentQueries", recentQueries);

        // ── Pending Escalations (queries admin needs to answer) ──
        List<Map<String, Object>> pendingEscalations = studentQueryRepository
                .findByEscalatedToAdmin(true)
                .stream()
                .map(q -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("queryId", q.getId());
                    map.put("studentId", q.getStudentId());
                    map.put("question", q.getQuestion());
                    map.put("intent", q.getIntent());
                    map.put("createdAt", q.getCreatedAt());
                    return map;
                })
                .collect(Collectors.toList());
        dashboard.put("pendingEscalations", pendingEscalations);
        dashboard.put("pendingEscalationCount", pendingEscalations.size());

        // ── High Risk Students ──
        List<Map<String, Object>> highRiskStudents = aiPredictionRepository
                .findByRiskLevel("HIGH")
                .stream()
                .map(p -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("studentId", p.getStudentId());
                    map.put("serviceType", p.getServiceType());
                    map.put("riskScore", p.getRiskScore());
                    map.put("detectedAt", p.getCreatedAt());

                    // Get student name
                    studentRepository.findById(p.getStudentId()).ifPresent(s -> {
                        map.put("studentName", s.getFirstName() + " " + s.getLastName());
                        map.put("rollNumber", s.getRollNumber());
                    });

                    return map;
                })
                .collect(Collectors.toList());
        dashboard.put("highRiskStudents", highRiskStudents);

        // ── Query Intent Distribution ──
        List<Object[]> intentCounts = studentQueryRepository.countByIntent();
        Map<String, Long> intentDistribution = new LinkedHashMap<>();
        for (Object[] row : intentCounts) {
            intentDistribution.put((String) row[0], (Long) row[1]);
        }
        dashboard.put("queryIntentDistribution", intentDistribution);

        // ── System Status ──
        Map<String, Object> systemStatus = new HashMap<>();
        systemStatus.put("automationEngineActive", true);
        systemStatus.put("schedulerActive", true);
        systemStatus.put("lastFeeAutomation", "Check automation_actions table");
        systemStatus.put("lastAttendanceCheck", "Check automation_actions table");
        dashboard.put("systemStatus", systemStatus);

        return dashboard;
    }

    // ================================================
    // STUDENT AI PROFILE — What AI knows about student
    // ================================================
    public Map<String, Object> getStudentAiProfile(Long studentId) {
        Map<String, Object> profile = new HashMap<>();

        // Student info
        studentRepository.findById(studentId).ifPresent(s -> {
            Map<String, Object> info = new HashMap<>();
            info.put("id", s.getId());
            info.put("name", s.getFirstName() + " " + s.getLastName());
            info.put("rollNumber", s.getRollNumber());
            info.put("department", s.getDepartment());
            profile.put("student", info);
        });

        // All AI predictions for this student
        List<AiPrediction> predictions = aiPredictionRepository
                .findByStudentId(studentId);

        // Latest fee prediction
        predictions.stream()
                .filter(p -> p.getServiceType().equals("FEE_DEFAULTER"))
                .max(Comparator.comparing(AiPrediction::getCreatedAt))
                .ifPresent(p -> {
                    Map<String, Object> feePred = new HashMap<>();
                    feePred.put("riskScore", p.getRiskScore());
                    feePred.put("riskLevel", p.getRiskLevel());
                    feePred.put("predictedAt", p.getCreatedAt());
                    profile.put("latestFeeRisk", feePred);
                });

        // Latest attendance prediction
        predictions.stream()
                .filter(p -> p.getServiceType().equals("ATTENDANCE_ANOMALY"))
                .max(Comparator.comparing(AiPrediction::getCreatedAt))
                .ifPresent(p -> {
                    Map<String, Object> attPred = new HashMap<>();
                    attPred.put("riskScore", p.getRiskScore());
                    attPred.put("riskLevel", p.getRiskLevel());
                    attPred.put("predictedAt", p.getCreatedAt());
                    profile.put("latestAttendanceRisk", attPred);
                });

        // Latest exam prediction
        predictions.stream()
                .filter(p -> p.getServiceType().equals("EXAM_PREDICTOR"))
                .max(Comparator.comparing(AiPrediction::getCreatedAt))
                .ifPresent(p -> {
                    Map<String, Object> examPred = new HashMap<>();
                    examPred.put("riskScore", p.getRiskScore());
                    examPred.put("riskLevel", p.getRiskLevel());
                    examPred.put("predictedAt", p.getCreatedAt());
                    profile.put("latestExamPrediction", examPred);
                });

        // All automation actions taken for this student
        List<Map<String, Object>> actions = automationActionRepository
                .findByStudentId(studentId)
                .stream()
                .map(a -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("actionType", a.getActionType());
                    map.put("triggerReason", a.getTriggerReason());
                    map.put("messageSent", a.getMessageSent());
                    map.put("createdAt", a.getCreatedAt());
                    return map;
                })
                .collect(Collectors.toList());
        profile.put("automationHistory", actions);
        profile.put("totalActionsOnStudent", actions.size());

        // Student queries history
        List<Map<String, Object>> queries = studentQueryRepository
                .findByStudentId(studentId)
                .stream()
                .map(q -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("question", q.getQuestion());
                    map.put("intent", q.getIntent());
                    map.put("autoAnswered", q.getAutoAnswered());
                    map.put("response", q.getResponse());
                    map.put("createdAt", q.getCreatedAt());
                    return map;
                })
                .collect(Collectors.toList());
        profile.put("queryHistory", queries);
        profile.put("totalQueriesAsked", queries.size());

        // Overall AI risk assessment
        String overallRisk = calculateOverallRisk(predictions);
        profile.put("overallAiRiskLevel", overallRisk);
        profile.put("totalPredictions", predictions.size());

        return profile;
    }

    private String calculateOverallRisk(List<AiPrediction> predictions) {
        long highCount = predictions.stream()
                .filter(p -> "HIGH".equals(p.getRiskLevel()))
                .count();
        long mediumCount = predictions.stream()
                .filter(p -> "MEDIUM".equals(p.getRiskLevel()))
                .count();

        if (highCount >= 2) return "HIGH";
        if (highCount >= 1 || mediumCount >= 2) return "MEDIUM";
        return "LOW";
    }

    // ================================================
    // AUTOMATION HISTORY — All actions taken
    // ================================================
    public Map<String, Object> getAutomationHistory() {
        Map<String, Object> history = new HashMap<>();

        List<AutomationAction> allActions = automationActionRepository
                .findAll()
                .stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .collect(Collectors.toList());

        // Group by action type
        Map<String, List<Map<String, Object>>> grouped = new LinkedHashMap<>();

        for (AutomationAction action : allActions) {
            String type = action.getActionType();
            grouped.computeIfAbsent(type, k -> new ArrayList<>());

            Map<String, Object> map = new HashMap<>();
            map.put("id", action.getId());
            map.put("studentId", action.getStudentId());
            map.put("triggerReason", action.getTriggerReason());
            map.put("messageSent", action.getMessageSent());
            map.put("status", action.getStatus());
            map.put("createdAt", action.getCreatedAt());

            studentRepository.findById(action.getStudentId()).ifPresent(s ->
                    map.put("studentName", s.getFirstName() + " " + s.getLastName()));

            grouped.get(type).add(map);
        }

        history.put("totalActions", allActions.size());
        history.put("actionsByType", grouped);
        history.put("actionTypeSummary", grouped.entrySet().stream()
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        e -> e.getValue().size()
                )));

        return history;
    }


    public Map<String, Object> getAiServicesStatus() {
        Map<String, Object> status = new HashMap<>();

        status.put("feePredictor", checkService("http://localhost:8001/health"));
        status.put("attendanceAnomaly", checkService("http://localhost:8002/health"));
        status.put("examPredictor", checkService("http://localhost:8003/health"));
        status.put("queryClassifier", checkService("http://localhost:8004/health"));
        status.put("ocrService", checkService("http://localhost:8005/health"));

        long runningCount = status.values().stream()
                .filter(v -> {
                    if (v instanceof Map) {
                        return "running".equals(((Map<?, ?>) v).get("status"));
                    }
                    return false;
                })
                .count();

        status.put("totalServices", 5);
        status.put("runningServices", runningCount);
        status.put("allHealthy", runningCount == 5);

        return status;
    }

    private Map<String, Object> checkService(String url) {
        try {
            java.net.URL serviceUrl = new java.net.URL(url);
            java.net.HttpURLConnection conn =
                    (java.net.HttpURLConnection) serviceUrl.openConnection();
            conn.setConnectTimeout(2000);
            conn.setReadTimeout(2000);
            int responseCode = conn.getResponseCode();
            return Map.of("status", "running", "httpStatus", responseCode);
        } catch (Exception e) {
            return Map.of("status", "offline", "error", e.getMessage());
        }
    }
}