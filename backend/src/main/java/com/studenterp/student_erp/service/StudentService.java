package com.studenterp.student_erp.service;

import com.studenterp.student_erp.dto.request.StudentRequest;
import com.studenterp.student_erp.dto.response.StudentResponse;
import com.studenterp.student_erp.entity.Student;
import com.studenterp.student_erp.exception.ResourceNotFoundException;
import com.studenterp.student_erp.repository.UserRepository;
import com.studenterp.student_erp.repository.StudentRepository;
import com.studenterp.student_erp.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
public class StudentService {

    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // GET ALL STUDENTS
    public List<StudentResponse> getAllStudents() {
        return studentRepository.findAll()
                .stream()
                .map(StudentResponse::fromEntity)
                .collect(Collectors.toList());
    }

    // GET STUDENT BY ID
    public StudentResponse getStudentById(Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", id));
        return StudentResponse.fromEntity(student);
    }

    // GET STUDENT BY USER ID
    public StudentResponse getStudentByUserId(Long userId) {
        Student student = studentRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "userId", userId));
        return StudentResponse.fromEntity(student);
    }

    // CREATE STUDENT
    @Transactional
    public StudentResponse createStudent(StudentRequest request) {

        if (studentRepository.existsByRollNumber(request.getRollNumber())) {
            throw new RuntimeException("Roll number already exists: " + request.getRollNumber());
        }

        if (studentRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists: " + request.getEmail());
        }

        // Create or reuse user account
        User user;
        if (userRepository.existsByEmail(request.getEmail())) {
            user = userRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new RuntimeException("User not found"));
        } else {
            user = User.builder()
                    .email(request.getEmail())
                    .password(passwordEncoder.encode("Admin@123"))
                    .role(User.Role.student)
                    .isActive(true)
                    .build();
            user = userRepository.save(user);
        }

        Student student = Student.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .rollNumber(request.getRollNumber())
                .department(request.getDepartment())
                .semester(request.getSemester())
                .address(request.getAddress())
                .parentPhone(request.getParentPhone())
                .parentEmail(request.getParentEmail())
                .status(Student.Status.active)
                .userId(user.getId())
                .build();

        Student saved = studentRepository.save(student);
        return StudentResponse.fromEntity(saved);
    }

    // UPDATE STUDENT
    @Transactional
    public StudentResponse updateStudent(Long id, StudentRequest request) {

        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", id));

        // Check roll number conflict (only if changed)
        if (!student.getRollNumber().equals(request.getRollNumber())
                && studentRepository.existsByRollNumber(request.getRollNumber())) {
            throw new RuntimeException("Roll number already exists: " + request.getRollNumber());
        }

        student.setFirstName(request.getFirstName());
        student.setLastName(request.getLastName());
        student.setEmail(request.getEmail());
        student.setPhone(request.getPhone());
        student.setRollNumber(request.getRollNumber());
        student.setDepartment(request.getDepartment());
        student.setSemester(request.getSemester());
        student.setAddress(request.getAddress());
        student.setParentPhone(request.getParentPhone());
        student.setParentEmail(request.getParentEmail());

        Student updated = studentRepository.save(student);
        return StudentResponse.fromEntity(updated);
    }

    // DELETE STUDENT
    @Transactional
    public void deleteStudent(Long id) {

        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", id));

        Long userId = student.getUserId();

        // Delete student FIRST to avoid FK constraint
        studentRepository.deleteById(id);

        // Then delete linked user
        if (userId != null) {
            try {
                userRepository.deleteById(userId);
            } catch (Exception e) {
                System.out.println("Could not delete user: " + e.getMessage());
            }
        }
    }

    // SEARCH STUDENTS
    public List<StudentResponse> searchStudents(String query) {
        return studentRepository.searchStudents(query)
                .stream()
                .map(StudentResponse::fromEntity)
                .collect(Collectors.toList());
    }

    // GET ACTIVE STUDENTS
    public List<StudentResponse> getActiveStudents() {
        return studentRepository.findByStatus(Student.Status.active)
                .stream()
                .map(StudentResponse::fromEntity)
                .collect(Collectors.toList());
    }
}