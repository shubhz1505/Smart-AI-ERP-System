package com.studenterp.student_erp.controller;

import com.studenterp.student_erp.dto.request.AttendanceMarkRequest;
import com.studenterp.student_erp.dto.response.ApiResponse;
import com.studenterp.student_erp.entity.Attendance;
import com.studenterp.student_erp.entity.Fee;
import com.studenterp.student_erp.entity.Student;
import com.studenterp.student_erp.repository.AttendanceRepository;
import com.studenterp.student_erp.repository.FeeRepository;
import com.studenterp.student_erp.repository.StudentRepository;
import com.studenterp.student_erp.service.AttendanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;
    private final StudentRepository studentRepository;
    private final FeeRepository feeRepository;
    private final AttendanceRepository attendanceRepository;

    @PostMapping("/mark")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<ApiResponse<Void>> markAttendance(
            @Valid @RequestBody AttendanceMarkRequest request) {
        attendanceService.markAttendance(request);
        return ResponseEntity.ok(ApiResponse.success("Attendance marked successfully"));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<ApiResponse<List<Attendance>>> getStudentAttendance(
            @PathVariable Long studentId) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        attendanceService.getStudentAttendance(studentId),
                        "Attendance fetched successfully")
        );
    }

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

    @GetMapping("/overall/student/{studentId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getOverallAttendance(
            @PathVariable Long studentId) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        attendanceService.getOverallStudentAttendance(studentId),
                        "Overall attendance fetched")
        );
    }

    // NEW — returns all students with real attendance + fee data
    @GetMapping("/summary/all")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAllAttendanceSummary() {
        try {
            List<Student> students = studentRepository.findAll();
            List<Map<String, Object>> result = new ArrayList<>();

            for (Student s : students) {
                Map<String, Object> map = new HashMap<>();
                map.put("studentId",  s.getId());
                map.put("firstName",  s.getFirstName());
                map.put("lastName",   s.getLastName());
                map.put("rollNumber", s.getRollNumber());
                map.put("department", s.getDepartment());
                map.put("semester",   s.getSemester());
                map.put("status",     s.getStatus() != null ? s.getStatus().name() : "active");

                // Real attendance
                List<Attendance> att = attendanceRepository.findByStudentId(s.getId());
                long total = att.size();
                long present = att.stream()
                        .filter(a -> a.getStatus() == Attendance.AttendanceStatus.present)
                        .count();
                double pct = total > 0
                        ? Math.round((present * 100.0 / total) * 10) / 10.0
                        : 0.0;
                map.put("totalClasses",   total);
                map.put("presentClasses", present);
                map.put("attendancePct",  pct);

                // Real fee data
                List<Fee> fees = feeRepository.findByStudentId(s.getId());
                boolean hasOverdue = fees.stream()
                        .anyMatch(f -> f.getPaymentStatus() == Fee.PaymentStatus.overdue);
                boolean allPaid = !fees.isEmpty() && fees.stream()
                        .allMatch(f -> f.getPaymentStatus() == Fee.PaymentStatus.paid);

                double totalFee = fees.stream()
                        .mapToDouble(f -> f.getTotalAmount() != null
                                ? f.getTotalAmount().doubleValue() : 0)
                        .sum();
                double paidAmt = fees.stream()
                        .mapToDouble(f -> f.getPaidAmount() != null
                                ? f.getPaidAmount().doubleValue() : 0)
                        .sum();
                double dueAmt = totalFee - paidAmt;

                String feeStatus = hasOverdue ? "overdue" : allPaid ? "paid" : "pending";
                map.put("feeStatus",  feeStatus);
                map.put("totalFee",   totalFee);
                map.put("paidAmount", paidAmt);
                map.put("dueAmount",  dueAmt);

                result.add(map);
            }

            return ResponseEntity.ok(
                    ApiResponse.success(result, "Student summary fetched successfully"));

        } catch (Exception e) {
            return ResponseEntity.status(500).body(
                    ApiResponse.error("Failed to fetch summary: " + e.getMessage()));
        }
    }
}