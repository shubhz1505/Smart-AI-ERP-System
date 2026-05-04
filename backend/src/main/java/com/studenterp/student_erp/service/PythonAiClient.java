package com.studenterp.student_erp.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientException;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class PythonAiClient {

    @Value("${ai.fee-predictor.url}")
    private String feePredictorUrl;

    @Value("${ai.attendance-anomaly.url}")
    private String attendanceAnomalyUrl;

    @Value("${ai.exam-predictor.url}")
    private String examPredictorUrl;

    @Value("${ai.query-classifier.url}")
    private String queryClassifierUrl;

    private final WebClient.Builder webClientBuilder;

    // ================================================
    // FEE DEFAULTER PREDICTION
    // ================================================
    public Map<String, Object> predictFeeDefaulter(
            Long studentId,
            double attendance,
            double pendingAmount,
            int daysSincePayment,
            int previousDefaults,
            int semester) {

        try {
            Map<String, Object> request = Map.of(
                    "studentId", studentId,
                    "attendancePercentage", attendance,
                    "pendingAmount", pendingAmount,
                    "daysSinceLastPayment", daysSincePayment,
                    "previousDefaults", previousDefaults,
                    "semester", semester
            );

            Map response = webClientBuilder.build()
                    .post()
                    .uri(feePredictorUrl + "/predict/fee-defaulter")
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            log.info("Fee prediction for student {}: riskLevel={}",
                    studentId, response.get("riskLevel"));
            return response;

        } catch (Exception e) {
            log.error("Fee predictor service unavailable: {}", e.getMessage());
            return Map.of(
                    "studentId", studentId,
                    "riskScore", 0.0,
                    "riskLevel", "UNKNOWN",
                    "shouldSendReminder", false,
                    "error", "AI service unavailable"
            );
        }
    }

    // ================================================
    // ATTENDANCE ANOMALY DETECTION
    // ================================================
    public Map<String, Object> detectAttendanceAnomaly(
            Long studentId,
            double overallPercentage,
            int consecutiveAbsences,
            int mondayAbsences,
            int totalClasses,
            int presentClasses) {

        try {
            Map<String, Object> request = Map.of(
                    "studentId", studentId,
                    "overallPercentage", overallPercentage,
                    "consecutiveAbsences", consecutiveAbsences,
                    "mondayAbsences", mondayAbsences,
                    "totalClasses", totalClasses,
                    "presentClasses", presentClasses
            );

            Map response = webClientBuilder.build()
                    .post()
                    .uri(attendanceAnomalyUrl + "/predict/attendance-anomaly")
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            log.info("Attendance anomaly for student {}: type={}",
                    studentId, response.get("anomalyType"));
            return response;

        } catch (Exception e) {
            log.error("Attendance anomaly service unavailable: {}", e.getMessage());
            return Map.of(
                    "studentId", studentId,
                    "anomalyType", "UNKNOWN",
                    "riskScore", 0.0,
                    "notifyParent", false,
                    "flagAdmin", false,
                    "error", "AI service unavailable"
            );
        }
    }

    // ================================================
    // EXAM PERFORMANCE PREDICTION
    // ================================================
    public Map<String, Object> predictExamPerformance(
            Long studentId,
            double attendance,
            double assignmentScore,
            double midtermScore,
            double quizAverage,
            double studyHours) {

        try {
            Map<String, Object> request = Map.of(
                    "studentId", studentId,
                    "attendancePercentage", attendance,
                    "assignmentScore", assignmentScore,
                    "midtermScore", midtermScore,
                    "quizAverage", quizAverage,
                    "studyHoursPerDay", studyHours
            );

            Map response = webClientBuilder.build()
                    .post()
                    .uri(examPredictorUrl + "/predict/exam-performance")
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            log.info("Exam prediction for student {}: score={}",
                    studentId, response.get("predictedScore"));
            return response;

        } catch (Exception e) {
            log.error("Exam predictor service unavailable: {}", e.getMessage());
            return Map.of(
                    "studentId", studentId,
                    "predictedScore", 0.0,
                    "riskLevel", "UNKNOWN",
                    "error", "AI service unavailable"
            );
        }
    }

    // ================================================
    // QUERY CLASSIFICATION
    // ================================================
    public Map<String, Object> classifyQuery(Long studentId, String question) {

        try {
            Map<String, Object> request = Map.of(
                    "studentId", studentId,
                    "question", question
            );

            Map response = webClientBuilder.build()
                    .post()
                    .uri(queryClassifierUrl + "/classify/query")
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            log.info("Query classified for student {}: intent={}, confidence={}",
                    studentId, response.get("intent"), response.get("confidence"));
            return response;

        } catch (Exception e) {
            log.error("Query classifier service unavailable: {}", e.getMessage());
            return Map.of(
                    "studentId", studentId,
                    "intent", "GENERAL_QUERY",
                    "confidence", 0.0,
                    "autoAnswer", false,
                    "escalateToAdmin", true,
                    "error", "AI service unavailable"
            );
        }
    }
}





