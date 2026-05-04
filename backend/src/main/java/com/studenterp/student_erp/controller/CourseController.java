package com.studenterp.student_erp.controller;

import com.studenterp.student_erp.dto.request.CourseRequest;
import com.studenterp.student_erp.dto.response.ApiResponse;
import com.studenterp.student_erp.dto.response.CourseResponse;
import com.studenterp.student_erp.entity.Enrollment;
import com.studenterp.student_erp.repository.EnrollmentRepository;
import com.studenterp.student_erp.service.CourseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;
    private final EnrollmentRepository enrollmentRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CourseResponse>>> getAllCourses() {
        return ResponseEntity.ok(
                ApiResponse.success(courseService.getAllCourses(), "Courses fetched successfully")
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CourseResponse>> getCourseById(@PathVariable Long id) {
        return ResponseEntity.ok(
                ApiResponse.success(courseService.getCourseById(id), "Course fetched successfully")
        );
    }

    @PostMapping
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<ApiResponse<CourseResponse>> createCourse(
            @Valid @RequestBody CourseRequest request) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        courseService.createCourse(request),
                        "Course created successfully"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<ApiResponse<CourseResponse>> updateCourse(
            @PathVariable Long id,
            @Valid @RequestBody CourseRequest request) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        courseService.updateCourse(id, request),
                        "Course updated successfully")
        );
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<ApiResponse<Void>> deleteCourse(@PathVariable Long id) {
        courseService.deleteCourse(id);
        return ResponseEntity.ok(ApiResponse.success("Course deleted successfully"));
    }

    @PostMapping("/{courseId}/enroll/{studentId}")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<ApiResponse<Void>> enrollStudent(
            @PathVariable Long courseId,
            @PathVariable Long studentId) {
        courseService.enrollStudent(courseId, studentId);
        return ResponseEntity.ok(ApiResponse.success("Student enrolled successfully"));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<ApiResponse<List<CourseResponse>>> getStudentCourses(
            @PathVariable Long studentId) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        courseService.getStudentCourses(studentId),
                        "Student courses fetched")
        );
    }

    // GET /api/courses/{courseId}/enrollments
    @GetMapping("/{courseId}/enrollments")
    public ResponseEntity<ApiResponse<List<Enrollment>>> getCourseEnrollments(
            @PathVariable Long courseId) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        enrollmentRepository.findByCourseId(courseId),
                        "Enrollments fetched successfully")
        );
    }

    // GET /api/courses/{courseId}/enrollment-count
    @GetMapping("/{courseId}/enrollment-count")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getEnrollmentCount(
            @PathVariable Long courseId) {
        long count = enrollmentRepository.countByCourseId(courseId);
        return ResponseEntity.ok(
                ApiResponse.success(
                        Map.of("courseId", courseId, "enrolledCount", count),
                        "Count fetched successfully")
        );
    }
}