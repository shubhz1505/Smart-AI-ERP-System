package com.studenterp.service;

import com.studenterp.student_erp.dto.request.FeeRequest;
import com.studenterp.student_erp.dto.request.PaymentRequest;
import com.studenterp.dto.response.FeeResponse;
import com.studenterp.entity.Fee;
import com.studenterp.entity.Payment;
import com.studenterp.exception.ResourceNotFoundException;
import com.studenterp.repository.FeeRepository;
import com.studenterp.repository.PaymentRepository;
import com.studenterp.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FeeService {

    private final FeeRepository feeRepository;
    private final PaymentRepository paymentRepository;
    private final StudentRepository studentRepository;

    // GET ALL FEES
    public List<FeeResponse> getAllFees() {
        return feeRepository.findAll()
                .stream()
                .map(FeeResponse::fromEntity)
                .collect(Collectors.toList());
    }

    // GET FEES BY STUDENT ID
    public List<FeeResponse> getFeesByStudentId(Long studentId) {
        return feeRepository.findByStudentId(studentId)
                .stream()
                .map(FeeResponse::fromEntity)
                .collect(Collectors.toList());
    }

    // GET SINGLE FEE
    public FeeResponse getFeeById(Long id) {
        Fee fee = feeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Fee", "id", id));
        return FeeResponse.fromEntity(fee);
    }

    // CREATE FEE
    @Transactional
    public FeeResponse createFee(FeeRequest request) {

        // Verify student exists
        studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Student", "id", request.getStudentId()));

        Fee fee = Fee.builder()
                .studentId(request.getStudentId())
                .feeType(request.getFeeType())
                .totalAmount(request.getTotalAmount())
                .paidAmount(BigDecimal.ZERO)
                .dueDate(request.getDueDate())
                .paymentStatus(Fee.PaymentStatus.pending)
                .semester(request.getSemester())
                .academicYear(request.getAcademicYear())
                .build();

        Fee saved = feeRepository.save(fee);
        return FeeResponse.fromEntity(saved);
    }

    // UPDATE FEE
    @Transactional
    public FeeResponse updateFee(Long id, FeeRequest request) {
        Fee fee = feeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Fee", "id", id));

        fee.setFeeType(request.getFeeType());
        fee.setTotalAmount(request.getTotalAmount());
        fee.setDueDate(request.getDueDate());
        fee.setSemester(request.getSemester());
        fee.setAcademicYear(request.getAcademicYear());

        Fee updated = feeRepository.save(fee);
        return FeeResponse.fromEntity(updated);
    }

    // DELETE FEE
    @Transactional
    public void deleteFee(Long id) {
        Fee fee = feeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Fee", "id", id));
        feeRepository.delete(fee);
    }

    // RECORD PAYMENT
    @Transactional
    public FeeResponse recordPayment(Long feeId, PaymentRequest request) {

        Fee fee = feeRepository.findById(feeId)
                .orElseThrow(() -> new ResourceNotFoundException("Fee", "id", feeId));

        BigDecimal newPaidAmount = fee.getPaidAmount().add(request.getAmount());

        // Validate payment amount
        if (newPaidAmount.compareTo(fee.getTotalAmount()) > 0) {
            throw new RuntimeException("Payment amount exceeds total fee amount");
        }

        // Update fee paid amount
        fee.setPaidAmount(newPaidAmount);

        // Update payment status
        if (newPaidAmount.compareTo(fee.getTotalAmount()) == 0) {
            fee.setPaymentStatus(Fee.PaymentStatus.paid);
        } else {
            fee.setPaymentStatus(Fee.PaymentStatus.partial);
        }

        feeRepository.save(fee);

        // Create payment record
        Payment payment = Payment.builder()
                .feeId(feeId)
                .studentId(fee.getStudentId())
                .amount(request.getAmount())
                .paymentMethod(request.getPaymentMethod())
                .transactionId(request.getTransactionId())
                .notes(request.getNotes())
                .build();

        paymentRepository.save(payment);

        return FeeResponse.fromEntity(fee);
    }

    // GET FEE STATISTICS
    public Map<String, Object> getFeeStatistics() {
        Map<String, Object> stats = new HashMap<>();

        BigDecimal totalFees = feeRepository.getTotalFees();
        BigDecimal totalPaid = feeRepository.getTotalPaid();
        BigDecimal totalPending = feeRepository.getTotalPending();
        Long overdueCount = feeRepository.getOverdueCount();

        stats.put("totalFees", totalFees != null ? totalFees : BigDecimal.ZERO);
        stats.put("totalPaid", totalPaid != null ? totalPaid : BigDecimal.ZERO);
        stats.put("totalPending", totalPending != null ? totalPending : BigDecimal.ZERO);
        stats.put("overdueCount", overdueCount != null ? overdueCount : 0);

        return stats;
    }

    // GET PENDING FEES
    public List<FeeResponse> getPendingFees() {
        return feeRepository.findByPaymentStatus(Fee.PaymentStatus.pending)
                .stream()
                .map(FeeResponse::fromEntity)
                .collect(Collectors.toList());
    }

    // GET OVERDUE FEES
    public List<FeeResponse> getOverdueFees() {
        return feeRepository.findByPaymentStatus(Fee.PaymentStatus.overdue)
                .stream()
                .map(FeeResponse::fromEntity)
                .collect(Collectors.toList());
    }

    // GET PAYMENT HISTORY FOR A FEE
    public List<Payment> getPaymentHistory(Long feeId) {
        return paymentRepository.findByFeeId(feeId);
    }
}