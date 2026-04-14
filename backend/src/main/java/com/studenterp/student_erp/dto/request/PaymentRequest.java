package com.studenterp.student_erp.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class PaymentRequest {

    @JsonProperty("amount")
    @NotNull(message = "Amount is required")
    private BigDecimal amount;

    @JsonProperty("paymentMethod")
    private String paymentMethod;

    @JsonProperty("transactionId")
    private String transactionId;

    @JsonProperty("notes")
    private String notes;
}