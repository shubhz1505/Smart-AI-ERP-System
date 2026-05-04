package com.studenterp.student_erp.repository;

import com.studenterp.student_erp.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {

    boolean existsByCourseCode(String courseCode);
    List<Course> findByDepartment(String department);
    List<Course> findBySemester(Integer semester);
}





