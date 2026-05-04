package com.studenterp.student_erp.controller;

import com.studenterp.student_erp.dto.request.FeeRequest;
import com.studenterp.student_erp.dto.request.PaymentRequest;
import com.studenterp.student_erp.dto.response.ApiResponse;
import com.studenterp.student_erp.dto.response.FeeResponse;
import com.studenterp.student_erp.entity.Payment;
import com.studenterp.student_erp.service.FeeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/fees")
@RequiredArgsConstructor
public class FeeController {

    private final FeeService feeService;

    // GET /api/fees
    @GetMapping
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<ApiResponse<List<FeeResponse>>> getAllFees() {
        return ResponseEntity.ok(
                ApiResponse.success(feeService.getAllFees(), "Fees fetched successfully")
        );
    }

    // GET /api/fees/{id}
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<FeeResponse>> getFeeById(@PathVariable Long id) {
        return ResponseEntity.ok(
                ApiResponse.success(feeService.getFeeById(id), "Fee fetched successfully")
        );
    }

    // GET /api/fees/student/{studentId}
    @GetMapping("/student/{studentId}")
    public ResponseEntity<ApiResponse<List<FeeResponse>>> getFeesByStudent(
            @PathVariable Long studentId) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        feeService.getFeesByStudentId(studentId),
                        "Student fees fetched successfully")
        );
    }

    // POST /api/fees
    @PostMapping
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<ApiResponse<FeeResponse>> createFee(
            @Valid @RequestBody FeeRequest request) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        feeService.createFee(request),
                        "Fee created successfully"));
    }

    // PUT /api/fees/{id}
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<ApiResponse<FeeResponse>> updateFee(
            @PathVariable Long id,
            @Valid @RequestBody FeeRequest request) {
        return ResponseEntity.ok(
                ApiResponse.success(feeService.updateFee(id, request), "Fee updated successfully")
        );
    }

    // DELETE /api/fees/{id}
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<ApiResponse<Void>> deleteFee(@PathVariable Long id) {
        feeService.deleteFee(id);
        return ResponseEntity.ok(ApiResponse.success("Fee deleted successfully"));
    }

    // POST /api/fees/{id}/payment
    @PostMapping("/{id}/payment")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<ApiResponse<FeeResponse>> recordPayment(
            @PathVariable Long id,
            @Valid @RequestBody PaymentRequest request) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        feeService.recordPayment(id, request),
                        "Payment recorded successfully")
        );
    }

    // GET /api/fees/statistics
    @GetMapping("/statistics")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getFeeStatistics() {
        return ResponseEntity.ok(
                ApiResponse.success(feeService.getFeeStatistics(), "Statistics fetched")
        );
    }

    // GET /api/fees/pending
    @GetMapping("/pending")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<ApiResponse<List<FeeResponse>>> getPendingFees() {
        return ResponseEntity.ok(
                ApiResponse.success(feeService.getPendingFees(), "Pending fees fetched")
        );
    }

    // GET /api/fees/overdue
    @GetMapping("/overdue")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<ApiResponse<List<FeeResponse>>> getOverdueFees() {
        return ResponseEntity.ok(
                ApiResponse.success(feeService.getOverdueFees(), "Overdue fees fetched")
        );
    }

    // GET /api/fees/{id}/payments
    @GetMapping("/{id}/payments")
    public ResponseEntity<ApiResponse<List<Payment>>> getPaymentHistory(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        feeService.getPaymentHistory(id),
                        "Payment history fetched")
        );
    }
}





