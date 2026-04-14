package com.studenterp.repository;

import com.studenterp.entity.Fee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface FeeRepository extends JpaRepository<Fee, Long> {

    List<Fee> findByStudentId(Long studentId);

    List<Fee> findByPaymentStatus(Fee.PaymentStatus status);

    List<Fee> findByStudentIdAndPaymentStatus(Long studentId, Fee.PaymentStatus status);

    @Query("SELECT SUM(f.totalAmount) FROM Fee f")
    BigDecimal getTotalFees();

    @Query("SELECT SUM(f.paidAmount) FROM Fee f")
    BigDecimal getTotalPaid();

    @Query("SELECT SUM(f.totalAmount - f.paidAmount) FROM Fee f WHERE f.paymentStatus != 'paid'")
    BigDecimal getTotalPending();

    @Query("SELECT COUNT(f) FROM Fee f WHERE f.paymentStatus = 'overdue'")
    Long getOverdueCount();

    List<Fee> findByStudentIdAndSemester(Long studentId, Integer semester);
}