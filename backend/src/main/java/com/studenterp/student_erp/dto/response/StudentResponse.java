package com.studenterp.student_erp.dto.response;

import com.studenterp.student_erp.entity.Student;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentResponse {

    private Long id;
    private Long userId;
    private String rollNumber;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private LocalDate dateOfBirth;
    private String address;
    private String parentPhone;
    private String parentEmail;
    private String department;
    private Integer semester;
    private String status;
    private LocalDateTime createdAt;

    // Convert Student entity to StudentResponse
    public static StudentResponse fromEntity(Student student) {
        return StudentResponse.builder()
                .id(student.getId())
                .userId(student.getUserId())
                .rollNumber(student.getRollNumber())
                .firstName(student.getFirstName())
                .lastName(student.getLastName())
                .email(student.getEmail())
                .phone(student.getPhone())
                .dateOfBirth(student.getDateOfBirth())
                .address(student.getAddress())
                .parentPhone(student.getParentPhone())
                .parentEmail(student.getParentEmail())
                .department(student.getDepartment())
                .semester(student.getSemester())
                .status(student.getStatus().name())
                .createdAt(student.getCreatedAt())
                .build();
    }
}





