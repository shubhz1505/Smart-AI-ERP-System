package com.studenterp.student_erp.controller;

import com.studenterp.student_erp.dto.request.LoginRequest;
import com.studenterp.student_erp.dto.request.RegisterRequest;
import com.studenterp.student_erp.dto.response.ApiResponse;
import com.studenterp.student_erp.dto.response.AuthResponse;
import com.studenterp.student_erp.entity.User;
import com.studenterp.student_erp.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    // POST /api/auth/login
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request) {

        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(
                ApiResponse.success(response, "Login successful")
        );
    }

    // POST /api/auth/register
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(
            @Valid @RequestBody RegisterRequest request) {

        AuthResponse response = authService.register(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Registration successful"));
    }

    // GET /api/auth/profile
    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<User>> getProfile(
            @AuthenticationPrincipal UserDetails userDetails) {

        User user = authService.getProfile(userDetails.getUsername());
        return ResponseEntity.ok(
                ApiResponse.success(user, "Profile fetched successfully")
        );
    }

    // GET /api/auth/me (quick check - returns logged in user info)
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<String>> getCurrentUser(
            @AuthenticationPrincipal UserDetails userDetails) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        userDetails.getUsername(),
                        "Authenticated as: " + userDetails.getUsername()
                )
        );
    }
}





