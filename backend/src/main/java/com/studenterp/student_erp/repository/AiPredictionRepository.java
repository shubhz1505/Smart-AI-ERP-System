package com.studenterp.repository;

import com.studenterp.entity.AiPrediction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AiPredictionRepository extends JpaRepository<AiPrediction, Long> {

    List<AiPrediction> findByStudentId(Long studentId);
    List<AiPrediction> findByServiceType(String serviceType);
    List<AiPrediction> findByRiskLevel(String riskLevel);

    @Query("SELECT COUNT(p) FROM AiPrediction p WHERE p.riskLevel = 'HIGH'")
    Long countHighRiskPredictions();

    @Query("SELECT COUNT(p) FROM AiPrediction p WHERE p.serviceType = :serviceType")
    Long countByServiceType(String serviceType);

    List<AiPrediction> findTop10ByOrderByCreatedAtDesc();

    List<AiPrediction> findByStudentIdAndServiceType(Long studentId, String serviceType);
}