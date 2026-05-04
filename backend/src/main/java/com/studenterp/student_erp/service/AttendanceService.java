package com.studenterp.student_erp.service;

import com.studenterp.student_erp.dto.request.AttendanceMarkRequest;
import com.studenterp.student_erp.entity.Attendance;
import com.studenterp.student_erp.exception.ResourceNotFoundException;
import com.studenterp.student_erp.repository.AttendanceRepository;
import com.studenterp.student_erp.repository.CourseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final CourseRepository courseRepository;

    // MARK ATTENDANCE (bulk)
    @Transactional
    public void markAttendance(AttendanceMarkRequest request) {
        courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Course", "id", request.getCourseId()));

        for (AttendanceMarkRequest.AttendanceEntry entry : request.getAttendanceList()) {
            Attendance attendance = Attendance.builder()
                    .studentId(entry.getStudentId())
                    .courseId(request.getCourseId())
                    .date(request.getDate())
                    .status(entry.getStatus())
                    .build();
            attendanceRepository.save(attendance);
        }
    }

    // GET STUDENT ATTENDANCE
    public List<Attendance> getStudentAttendance(Long studentId) {
        return attendanceRepository.findByStudentId(studentId);
    }

    // GET COURSE ATTENDANCE
    public List<Attendance> getCourseAttendance(Long courseId) {
        return attendanceRepository.findByCourseId(courseId);
    }

    // GET ATTENDANCE BY DATE
    public List<Attendance> getAttendanceByDate(LocalDate date) {
        return attendanceRepository.findByDate(date);
    }

    // GET STUDENT ATTENDANCE PERCENTAGE
    public Map<String, Object> getStudentAttendancePercentage(Long studentId, Long courseId) {
        Long total = attendanceRepository.countTotalClasses(studentId, courseId);
        Long present = attendanceRepository.countPresentClasses(studentId, courseId);
        Double percentage = attendanceRepository.getAttendancePercentage(studentId, courseId);

        Map<String, Object> result = new HashMap<>();
        result.put("studentId", studentId);
        result.put("courseId", courseId);
        result.put("totalClasses", total != null ? total : 0);
        result.put("presentClasses", present != null ? present : 0);
        result.put("percentage", percentage != null ?
                Math.round(percentage * 100.0) / 100.0 : 0.0);
        result.put("status", percentage != null && percentage >= 75 ? "Safe" : "At Risk");

        return result;
    }

    // GET OVERALL STUDENT ATTENDANCE
    public Map<String, Object> getOverallStudentAttendance(Long studentId) {
        List<Attendance> all = attendanceRepository.findByStudentId(studentId);
        long total = all.size();
        long present = all.stream()
                .filter(a -> a.getStatus() == Attendance.AttendanceStatus.present)
                .count();

        double percentage = total > 0 ? (present * 100.0 / total) : 0.0;

        Map<String, Object> result = new HashMap<>();
        result.put("studentId", studentId);
        result.put("totalClasses", total);
        result.put("presentClasses", present);
        result.put("percentage", Math.round(percentage * 100.0) / 100.0);
        result.put("status", percentage >= 75 ? "Safe" : "At Risk");

        return result;
    }
}





