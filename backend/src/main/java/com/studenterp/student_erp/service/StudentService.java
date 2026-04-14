package com.studenterp.service;

import com.studenterp.student_erp.dto.request.StudentRequest;
import com.studenterp.dto.response.StudentResponse;
import com.studenterp.entity.Student;
import com.studenterp.exception.ResourceNotFoundException;
import com.studenterp.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StudentService {

    private final StudentRepository studentRepository;

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

    // DELETE STUDENT (soft delete)
    @Transactional
    public void deleteStudent(Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", id));

        student.setStatus(Student.Status.inactive);
        studentRepository.save(student);
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