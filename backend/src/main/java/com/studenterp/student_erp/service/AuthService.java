package com.studenterp.service;

import com.studenterp.student_erp.dto.request.LoginRequest;
import com.studenterp.student_erp.dto.request.RegisterRequest;
import com.studenterp.dto.response.AuthResponse;
import com.studenterp.entity.Student;
import com.studenterp.entity.User;
import com.studenterp.exception.ResourceNotFoundException;
import com.studenterp.repository.StudentRepository;
import com.studenterp.repository.UserRepository;
import com.studenterp.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    // LOGIN
    public AuthResponse login(LoginRequest request) {

        // Authenticate (Spring Security checks email + password automatically)
        // If wrong credentials, BadCredentialsException is thrown automatically
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        // Get user from database
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Generate JWT token
        String token = jwtUtil.generateToken(user.getEmail());

        // Get student details if role is student
        String firstName = "";
        String lastName = "";

        if (user.getRole() == User.Role.student) {
            Student student = studentRepository.findByUserId(user.getId()).orElse(null);
            if (student != null) {
                firstName = student.getFirstName();
                lastName = student.getLastName();
            }
        }

        return AuthResponse.builder()
                .token(token)
                .id(user.getId())
                .email(user.getEmail())
                .role(user.getRole().name())
                .firstName(firstName)
                .lastName(lastName)
                .build();
    }

    // REGISTER
    @Transactional
    public AuthResponse register(RegisterRequest request) {

        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        // Check duplicate roll number
        if (request.getRole() == User.Role.student
                && request.getRollNumber() != null
                && studentRepository.existsByRollNumber(request.getRollNumber())) {
            throw new RuntimeException("Roll number already exists");
        }

        // Create user account
        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .isActive(true)
                .build();

        User savedUser = userRepository.save(user);

        // If student role, create student record too
        if (request.getRole() == User.Role.student) {
            Student student = Student.builder()
                    .userId(savedUser.getId())
                    .firstName(request.getFirstName())
                    .lastName(request.getLastName())
                    .email(request.getEmail())
                    .phone(request.getPhone())
                    .rollNumber(request.getRollNumber())
                    .department(request.getDepartment())
                    .semester(request.getSemester())
                    .status(Student.Status.active)
                    .build();

            studentRepository.save(student);
        }

        // Generate token
        String token = jwtUtil.generateToken(savedUser.getEmail());

        return AuthResponse.builder()
                .token(token)
                .id(savedUser.getId())
                .email(savedUser.getEmail())
                .role(savedUser.getRole().name())
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .build();
    }

    // GET PROFILE
    public User getProfile(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}