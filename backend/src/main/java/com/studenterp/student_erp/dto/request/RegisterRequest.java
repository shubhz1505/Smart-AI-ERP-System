package com.studenterp.student_erp.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.studenterp.entity.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {

    @JsonProperty("firstName")
    @NotBlank(message = "First name is required")
    private String firstName;

    @JsonProperty("lastName")
    @NotBlank(message = "Last name is required")
    private String lastName;

    @JsonProperty("email")
    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid email")
    private String email;

    @JsonProperty("password")
    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;

    private String phone;
    private String rollNumber;
    private String department;
    private Integer semester;

    private User.Role role = User.Role.student;
}