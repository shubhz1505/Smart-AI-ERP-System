package com.studenterp.student_erp.controller;

import com.studenterp.student_erp.dto.response.ApiResponse;
import com.studenterp.student_erp.service.AiDashboardService;
import com.studenterp.student_erp.service.AutomationEngineService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final AutomationEngineService automationEngine;
    private final AiDashboardService aiDashboardService;

    

    @PostMapping("/automation/fees")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> runFeeAutomation() {
        Map<String, Object> result = automationEngine.runFeeAutomation();
        return ResponseEntity.ok(
                ApiResponse.success(result, "Fee automation completed")
        );
    }

    @PostMapping("/automation/attendance")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> runAttendanceAutomation() {
        Map<String, Object> result = automationEngine.runAttendanceAutomation();
        return ResponseEntity.ok(
                ApiResponse.success(result, "Attendance automation completed")
        );
    }



    @PostMapping("/query")
    public ResponseEntity<ApiResponse<Map<String, Object>>> handleQuery(
            @RequestBody Map<String, Object> body) {
        Long studentId = Long.valueOf(body.get("studentId").toString());
        String question = (String) body.get("question");
        Map<String, Object> result = automationEngine.handleStudentQuery(studentId, question);
        return ResponseEntity.ok(ApiResponse.success(result, "Query processed"));
    }


    @PostMapping("/exam-prediction/{studentId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> predictExam(
            @PathVariable Long studentId,
            @RequestBody Map<String, Object> body) {
        double assignment = Double.parseDouble(body.get("assignmentScore").toString());
        double midterm = Double.parseDouble(body.get("midtermScore").toString());
        double quiz = Double.parseDouble(body.get("quizAverage").toString());
        double hours = Double.parseDouble(
                body.getOrDefault("studyHoursPerDay", 2.0).toString());
        Map<String, Object> result = automationEngine.predictStudentExam(
                studentId, assignment, midterm, quiz, hours);
        return ResponseEntity.ok(ApiResponse.success(result, "Exam prediction completed"));
    }


    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAiDashboard() {
        return ResponseEntity.ok(
                ApiResponse.success(
                        aiDashboardService.getAiDashboard(),
                        "AI Dashboard fetched successfully")
        );
    }


    @GetMapping("/profile/student/{studentId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStudentAiProfile(
            @PathVariable Long studentId) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        aiDashboardService.getStudentAiProfile(studentId),
                        "Student AI profile fetched")
        );
    }



    @GetMapping("/automation/history")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAutomationHistory() {
        return ResponseEntity.ok(
                ApiResponse.success(
                        aiDashboardService.getAutomationHistory(),
                        "Automation history fetched")
        );
    }



    @GetMapping("/services/health")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getServicesHealth() {
        return ResponseEntity.ok(
                ApiResponse.success(
                        aiDashboardService.getAiServicesStatus(),
                        "Services health checked")
        );
    }



    @GetMapping("/queries/escalated")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<ApiResponse<Object>> getEscalatedQueries() {
        var queries = aiDashboardService.getAiDashboard().get("pendingEscalations");
        return ResponseEntity.ok(
                ApiResponse.success(queries, "Escalated queries fetched")
        );
    }



    @GetMapping("/students/high-risk")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<ApiResponse<Object>> getHighRiskStudents() {
        var students = aiDashboardService.getAiDashboard().get("highRiskStudents");
        return ResponseEntity.ok(
                ApiResponse.success(students, "High risk students fetched")
        );
    }
}





