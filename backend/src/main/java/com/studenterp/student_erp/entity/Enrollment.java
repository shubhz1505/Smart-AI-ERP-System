package com.studenterp.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "enrollments")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Enrollment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "student_id")
    private Long studentId;

    @Column(name = "course_id")
    private Long courseId;

    @Column(name = "enrollment_date")
    private LocalDateTime enrollmentDate;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    private EnrollmentStatus status = EnrollmentStatus.active;

    private String grade;

    public enum EnrollmentStatus {
        active, completed, dropped, enrolled,
    }

    @PrePersist
    protected void onCreate() {
        enrollmentDate = LocalDateTime.now();
    }
}