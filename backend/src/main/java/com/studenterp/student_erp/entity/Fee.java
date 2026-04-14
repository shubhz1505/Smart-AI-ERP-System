package com.studenterp.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "fees")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Fee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "student_id")
    private Long studentId;

    @Column(name = "fee_type")
    private String feeType;

    @Column(name = "total_amount")
    private BigDecimal totalAmount;

    @Builder.Default
    @Column(name = "paid_amount")
    private BigDecimal paidAmount = BigDecimal.ZERO;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Builder.Default
    @Column(name = "payment_status")
    @Enumerated(EnumType.STRING)
    private PaymentStatus paymentStatus = PaymentStatus.pending;

    private Integer semester;

    @Column(name = "academic_year")
    private String academicYear;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    public enum PaymentStatus {
        pending, partial, paid, overdue
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}