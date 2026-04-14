package com.studenterp.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "student_queries")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentQuery {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "student_id")
    private Long studentId;

    @Column(name = "question")
    private String question;

    private String intent;
    private BigDecimal confidence;

    @Column(name = "auto_answered")
    private Boolean autoAnswered;

    private String response;

    @Column(name = "escalated_to_admin")
    private Boolean escalatedToAdmin;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}