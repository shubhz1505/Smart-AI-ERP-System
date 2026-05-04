package com.studenterp.student_erp.controller;

import com.studenterp.student_erp.dto.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
public class HealthController {

    @GetMapping("/health")
    public ResponseEntity<ApiResponse<Map<String, String>>> health() {
        return ResponseEntity.ok(
                ApiResponse.success(
                        Map.of(
                                "status", "running",
                                "timestamp", LocalDateTime.now().toString()
                        ),
                        "Server is healthy"
                )
        );
    }
}





