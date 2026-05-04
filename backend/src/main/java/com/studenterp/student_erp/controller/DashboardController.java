package com.studenterp.student_erp.controller;

import com.studenterp.student_erp.dto.response.ApiResponse;
import com.studenterp.student_erp.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    // GET /api/dashboard/admin
    @GetMapping("/admin")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAdminDashboard() {
        return ResponseEntity.ok(
                ApiResponse.success(
                        dashboardService.getAdminDashboard(),
                        "Admin dashboard fetched successfully")
        );
    }

    // GET /api/dashboard/student/{studentId}
    @GetMapping("/student/{studentId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStudentDashboard(
            @PathVariable Long studentId) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        dashboardService.getStudentDashboard(studentId),
                        "Student dashboard fetched successfully")
        );
    }
}







