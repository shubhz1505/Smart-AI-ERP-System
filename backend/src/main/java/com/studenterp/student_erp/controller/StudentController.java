package com.studenterp.controller;

import com.studenterp.student_erp.dto.request.StudentRequest;
import com.studenterp.dto.response.ApiResponse;
import com.studenterp.dto.response.StudentResponse;
import com.studenterp.service.StudentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/students")
@RequiredArgsConstructor
public class StudentController {

    private final StudentService studentService;

    // GET /api/students — Admin only
    @GetMapping
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<ApiResponse<List<StudentResponse>>> getAllStudents() {
        List<StudentResponse> students = studentService.getAllStudents();
        return ResponseEntity.ok(
                ApiResponse.success(students, "Students fetched successfully")
        );
    }

    // GET /api/students/{id}
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<StudentResponse>> getStudentById(@PathVariable Long id) {
        StudentResponse student = studentService.getStudentById(id);
        return ResponseEntity.ok(
                ApiResponse.success(student, "Student fetched successfully")
        );
    }

    // GET /api/students/user/{userId}
    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<StudentResponse>> getStudentByUserId(@PathVariable Long userId) {
        StudentResponse student = studentService.getStudentByUserId(userId);
        return ResponseEntity.ok(
                ApiResponse.success(student, "Student fetched successfully")
        );
    }

    // POST /api/students — Admin only
    @PostMapping
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<ApiResponse<StudentResponse>> createStudent(
            @Valid @RequestBody StudentRequest request) {
        StudentResponse student = studentService.createStudent(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(student, "Student created successfully"));
    }

    // PUT /api/students/{id} — Admin only
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<ApiResponse<StudentResponse>> updateStudent(
            @PathVariable Long id,
            @Valid @RequestBody StudentRequest request) {
        StudentResponse student = studentService.updateStudent(id, request);
        return ResponseEntity.ok(
                ApiResponse.success(student, "Student updated successfully")
        );
    }

    // DELETE /api/students/{id} — Admin only
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<ApiResponse<Void>> deleteStudent(@PathVariable Long id) {
        studentService.deleteStudent(id);
        return ResponseEntity.ok(
                ApiResponse.success("Student deleted successfully")
        );
    }

    // GET /api/students/search?query=aryan
    @GetMapping("/search")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<ApiResponse<List<StudentResponse>>> searchStudents(
            @RequestParam String query) {
        List<StudentResponse> students = studentService.searchStudents(query);
        return ResponseEntity.ok(
                ApiResponse.success(students, "Search results")
        );
    }
}