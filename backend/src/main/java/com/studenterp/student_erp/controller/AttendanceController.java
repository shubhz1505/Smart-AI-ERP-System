package com.studenterp.controller;

import com.studenterp.dto.request.AttendanceMarkRequest;
import com.studenterp.dto.response.ApiResponse;
import com.studenterp.entity.Attendance;
import com.studenterp.service.AttendanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;

    // POST /api/attendance/mark
    @PostMapping("/mark")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<ApiResponse<Void>> markAttendance(
            @Valid @RequestBody AttendanceMarkRequest request) {
        attendanceService.markAttendance(request);
        return ResponseEntity.ok(ApiResponse.success("Attendance marked successfully"));
    }

    // GET /api/attendance/student/{studentId}
    @GetMapping("/student/{studentId}")
    public ResponseEntity<ApiResponse<List<Attendance>>> getStudentAttendance(
            @PathVariable Long studentId) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        attendanceService.getStudentAttendance(studentId),
                        "Attendance fetched successfully")
        );
    }

    // GET /api/attendance/course/{courseId}
    @GetMapping("/course/{courseId}")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<ApiResponse<List<Attendance>>> getCourseAttendance(
            @PathVariable Long courseId) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        attendanceService.getCourseAttendance(courseId),
                        "Course attendance fetched")
        );
    }

    // GET /api/attendance/date/{date}
    @GetMapping("/date/{date}")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<ApiResponse<List<Attendance>>> getAttendanceByDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        attendanceService.getAttendanceByDate(date),
                        "Attendance fetched for date: " + date)
        );
    }

    // GET /api/attendance/percentage/student/{studentId}/course/{courseId}
    @GetMapping("/percentage/student/{studentId}/course/{courseId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAttendancePercentage(
            @PathVariable Long studentId,
            @PathVariable Long courseId) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        attendanceService.getStudentAttendancePercentage(studentId, courseId),
                        "Attendance percentage fetched")
        );
    }

    // GET /api/attendance/overall/student/{studentId}
    @GetMapping("/overall/student/{studentId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getOverallAttendance(
            @PathVariable Long studentId) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        attendanceService.getOverallStudentAttendance(studentId),
                        "Overall attendance fetched")
        );
    }
}