package com.studenterp.dto.response;

import com.studenterp.entity.Fee;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeeResponse {

    private Long id;
    private Long studentId;
    private String feeType;
    private BigDecimal totalAmount;
    private BigDecimal paidAmount;
    private BigDecimal dueAmount;
    private LocalDate dueDate;
    private String paymentStatus;
    private Integer semester;
    private String academicYear;
    private LocalDateTime createdAt;

    public static FeeResponse fromEntity(Fee fee) {
        BigDecimal due = fee.getTotalAmount().subtract(fee.getPaidAmount());
        return FeeResponse.builder()
                .id(fee.getId())
                .studentId(fee.getStudentId())
                .feeType(fee.getFeeType())
                .totalAmount(fee.getTotalAmount())
                .paidAmount(fee.getPaidAmount())
                .dueAmount(due)
                .dueDate(fee.getDueDate())
                .paymentStatus(fee.getPaymentStatus().name())
                .semester(fee.getSemester())
                .academicYear(fee.getAcademicYear())
                .createdAt(fee.getCreatedAt())
                .build();
    }
}