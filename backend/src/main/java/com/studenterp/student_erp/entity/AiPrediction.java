package com.studenterp.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "ai_predictions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiPrediction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "student_id")
    private Long studentId;

    @Column(name = "service_type")
    private String serviceType;

    @Column(name = "input_data", columnDefinition = "JSON")
    private String inputData;

    @Column(name = "risk_score")
    private BigDecimal riskScore;

    @Column(name = "risk_level")
    private String riskLevel;

    @Column(name = "prediction_result", columnDefinition = "JSON")
    private String predictionResult;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}