package com.studenterp.student_erp.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class FeeRequest {

    @JsonProperty("studentId")
    @NotNull(message = "Student ID is required")
    private Long studentId;

    @JsonProperty("feeType")
    private String feeType;

    @JsonProperty("totalAmount")
    @NotNull(message = "Total amount is required")
    private BigDecimal totalAmount;

    @JsonProperty("dueDate")
    private LocalDate dueDate;

    @JsonProperty("semester")
    private Integer semester;

    @JsonProperty("academicYear")
    private String academicYear;
}





