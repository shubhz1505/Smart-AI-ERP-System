package com.studenterp.student_erp.repository;

import com.studenterp.student_erp.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    List<Attendance> findByStudentId(Long studentId);

    List<Attendance> findByCourseId(Long courseId);

    List<Attendance> findByStudentIdAndCourseId(Long studentId, Long courseId);

    List<Attendance> findByDate(LocalDate date);

    List<Attendance> findByCourseIdAndDate(Long courseId, LocalDate date);

    // Count total classes for a student in a course
    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.studentId = :studentId AND a.courseId = :courseId")
    Long countTotalClasses(@Param("studentId") Long studentId, @Param("courseId") Long courseId);

    // Count present classes for a student in a course
    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.studentId = :studentId " +
            "AND a.courseId = :courseId AND a.status = 'present'")
    Long countPresentClasses(@Param("studentId") Long studentId, @Param("courseId") Long courseId);

    // Get attendance percentage
    @Query("SELECT (COUNT(CASE WHEN a.status = 'present' THEN 1 END) * 100.0 / COUNT(a)) " +
            "FROM Attendance a WHERE a.studentId = :studentId AND a.courseId = :courseId")
    Double getAttendancePercentage(@Param("studentId") Long studentId,
                                   @Param("courseId") Long courseId);
}





