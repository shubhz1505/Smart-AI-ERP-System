package com.studenterp.student_erp.service;

import com.studenterp.student_erp.dto.response.StudentResponse;
import com.studenterp.student_erp.entity.Fee;
import com.studenterp.student_erp.entity.Student;
import com.studenterp.student_erp.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final StudentRepository studentRepository;
    private final FeeRepository feeRepository;
    private final AttendanceRepository attendanceRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;

    // ADMIN DASHBOARD
    public Map<String, Object> getAdminDashboard() {
        Map<String, Object> dashboard = new HashMap<>();

        // Student stats
        long totalStudents = studentRepository.count();
        long activeStudents = studentRepository
                .findByStatus(Student.Status.active).size();

        // Fee stats
        BigDecimal totalFees = feeRepository.getTotalFees();
        BigDecimal totalPaid = feeRepository.getTotalPaid();
        BigDecimal totalPending = feeRepository.getTotalPending();
        Long overdueCount = feeRepository.getOverdueCount();

        // Course stats
        long totalCourses = courseRepository.count();

        // Today's attendance
        LocalDate today = LocalDate.now();
        long todayAttendance = attendanceRepository.findByDate(today).size();
        var allAttendance = attendanceRepository.findAll();

        long totalClasses = allAttendance.size();

        long presentClasses = allAttendance.stream()
                .filter(a -> a.getStatus().name().equalsIgnoreCase("present"))
                .count();

        double avgAttendance = totalClasses > 0
                ? Math.round((presentClasses * 100.0 / totalClasses) * 100.0) / 100.0
                : 0.0;
        System.out.println("AVG ATTENDANCE: " + avgAttendance);
        // Recent students (last 5)
        List<Map<String, Object>> recentStudents = studentRepository
                .findAll()
                .stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .limit(5)
                .map(s -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", s.getId());
                    map.put("name", s.getFirstName() + " " + s.getLastName());
                    map.put("rollNumber", s.getRollNumber());
                    map.put("department", s.getDepartment());
                    map.put("status", s.getStatus().name());
                    return map;
                })
                .collect(Collectors.toList());

        // Recent payments (last 5 paid fees)
        List<Map<String, Object>> recentPayments = feeRepository
                .findByPaymentStatus(Fee.PaymentStatus.paid)
                .stream()
                .limit(5)
                .map(f -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("feeId", f.getId());
                    map.put("studentId", f.getStudentId());
                    map.put("amount", f.getPaidAmount());
                    map.put("feeType", f.getFeeType());
                    return map;
                })
                .collect(Collectors.toList());

        // Pending fees list
        List<Map<String, Object>> pendingFees = feeRepository
                .findByPaymentStatus(Fee.PaymentStatus.pending)
                .stream()
                .limit(5)
                .map(f -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("feeId", f.getId());
                    map.put("studentId", f.getStudentId());
                    map.put("dueAmount", f.getTotalAmount().subtract(f.getPaidAmount()));
                    map.put("dueDate", f.getDueDate());
                    return map;
                })
                .collect(Collectors.toList());

        // Build response
        dashboard.put("totalStudents", totalStudents);
        dashboard.put("activeStudents", activeStudents);
        dashboard.put("totalCourses", totalCourses);
        dashboard.put("todayAttendanceCount", todayAttendance);
        dashboard.put("avgAttendance", avgAttendance);

        // Fee summary
        Map<String, Object> feeSummary = new HashMap<>();
        feeSummary.put("totalFees", totalFees != null ? totalFees : BigDecimal.ZERO);
        feeSummary.put("totalPaid", totalPaid != null ? totalPaid : BigDecimal.ZERO);
        feeSummary.put("totalPending", totalPending != null ? totalPending : BigDecimal.ZERO);
        feeSummary.put("overdueCount", overdueCount != null ? overdueCount : 0);
        dashboard.put("feeSummary", feeSummary);

        dashboard.put("recentStudents", recentStudents);
        dashboard.put("recentPayments", recentPayments);
        dashboard.put("pendingFees", pendingFees);

        return dashboard;
    }

    // STUDENT DASHBOARD
    public Map<String, Object> getStudentDashboard(Long studentId) {
        Map<String, Object> dashboard = new HashMap<>();

        // Student info
        Student student = studentRepository.findById(studentId).orElse(null);
        if (student == null) {
            dashboard.put("error", "Student not found");
            return dashboard;
        }

        // Student basic info
        Map<String, Object> studentInfo = new HashMap<>();
        studentInfo.put("id", student.getId());
        studentInfo.put("name", student.getFirstName() + " " + student.getLastName());
        studentInfo.put("rollNumber", student.getRollNumber());
        studentInfo.put("department", student.getDepartment());
        studentInfo.put("semester", student.getSemester());
        studentInfo.put("email", student.getEmail());
        dashboard.put("student", studentInfo);

        // Fee status
        List<Fee> fees = feeRepository.findByStudentId(studentId);
        BigDecimal totalFee = fees.stream()
                .map(Fee::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalPaid = fees.stream()
                .map(Fee::getPaidAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalDue = totalFee.subtract(totalPaid);

        long pendingCount = fees.stream()
                .filter(f -> f.getPaymentStatus() != Fee.PaymentStatus.paid)
                .count();

        Map<String, Object> feeStatus = new HashMap<>();
        feeStatus.put("totalFee", totalFee);
        feeStatus.put("totalPaid", totalPaid);
        feeStatus.put("totalDue", totalDue);
        feeStatus.put("pendingCount", pendingCount);
        feeStatus.put("status", totalDue.compareTo(BigDecimal.ZERO) == 0 ? "Paid" : "Pending");
        dashboard.put("feeStatus", feeStatus);

        // Attendance summary
        var allAttendance = attendanceRepository.findByStudentId(studentId);
        long totalClasses = allAttendance.size();
        long presentClasses = allAttendance.stream()
                .filter(a -> a.getStatus().name().equals("present"))
                .count();
        double attendancePercentage = totalClasses > 0
                ? Math.round((presentClasses * 100.0 / totalClasses) * 100.0) / 100.0
                : 0.0;

        Map<String, Object> attendanceSummary = new HashMap<>();
        attendanceSummary.put("totalClasses", totalClasses);
        attendanceSummary.put("presentClasses", presentClasses);
        attendanceSummary.put("percentage", attendancePercentage);
        attendanceSummary.put("status", attendancePercentage >= 75 ? "Safe" : "At Risk");
        dashboard.put("attendance", attendanceSummary);

        // Enrolled courses
        List<Map<String, Object>> enrolledCourses = enrollmentRepository
                .findByStudentId(studentId)
                .stream()
                .map(e -> courseRepository.findById(e.getCourseId()).map(c -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("courseId", c.getId());
                    map.put("courseCode", c.getCourseCode());
                    map.put("courseName", c.getCourseName());
                    map.put("credits", c.getCredits());
                    return map;
                }).orElse(null))
                .filter(c -> c != null)
                .collect(Collectors.toList());

        dashboard.put("enrolledCourses", enrolledCourses);
        dashboard.put("totalEnrolledCourses", enrolledCourses.size());

        return dashboard;
    }
}





