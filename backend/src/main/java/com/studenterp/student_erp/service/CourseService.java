package com.studenterp.service;

import com.studenterp.dto.request.CourseRequest;
import com.studenterp.dto.response.CourseResponse;
import com.studenterp.entity.Course;
import com.studenterp.entity.Enrollment;
import com.studenterp.exception.ResourceNotFoundException;
import com.studenterp.repository.CourseRepository;
import com.studenterp.repository.EnrollmentRepository;
import com.studenterp.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final StudentRepository studentRepository;

    public List<CourseResponse> getAllCourses() {
        return courseRepository.findAll()
                .stream()
                .map(CourseResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public CourseResponse getCourseById(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", id));
        return CourseResponse.fromEntity(course);
    }

    @Transactional
    public CourseResponse createCourse(CourseRequest request) {
        if (courseRepository.existsByCourseCode(request.getCourseCode())) {
            throw new RuntimeException("Course code already exists: " + request.getCourseCode());
        }

        Course course = Course.builder()
                .courseCode(request.getCourseCode())
                .courseName(request.getCourseName())
                .department(request.getDepartment())
                .credits(request.getCredits())
                .semester(request.getSemester())
                .description(request.getDescription())
                .build();

        return CourseResponse.fromEntity(courseRepository.save(course));
    }

    @Transactional
    public CourseResponse updateCourse(Long id, CourseRequest request) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", id));

        course.setCourseCode(request.getCourseCode());
        course.setCourseName(request.getCourseName());
        course.setDepartment(request.getDepartment());
        course.setCredits(request.getCredits());
        course.setSemester(request.getSemester());
        course.setDescription(request.getDescription());

        return CourseResponse.fromEntity(courseRepository.save(course));
    }

    @Transactional
    public void deleteCourse(Long id) {
        courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", id));
        courseRepository.deleteById(id);
    }

    @Transactional
    public void enrollStudent(Long courseId, Long studentId) {
        courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", courseId));
        studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", studentId));

        if (enrollmentRepository.existsByStudentIdAndCourseId(studentId, courseId)) {
            throw new RuntimeException("Student already enrolled in this course");
        }

        Enrollment enrollment = Enrollment.builder()
                .studentId(studentId)
                .courseId(courseId)
                .status(Enrollment.EnrollmentStatus.active)
                .build();

        enrollmentRepository.save(enrollment);
    }

    public List<CourseResponse> getStudentCourses(Long studentId) {
        List<Enrollment> enrollments = enrollmentRepository.findByStudentId(studentId);
        return enrollments.stream()
                .map(e -> courseRepository.findById(e.getCourseId()).orElse(null))
                .filter(c -> c != null)
                .map(CourseResponse::fromEntity)
                .collect(Collectors.toList());
    }
}