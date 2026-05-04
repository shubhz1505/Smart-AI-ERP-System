package com.studenterp.student_erp.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class StudentRequest {

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

    @JsonProperty("phone")
    private String phone;

    @JsonProperty("rollNumber")
    @NotBlank(message = "Roll number is required")
    private String rollNumber;

    @JsonProperty("department")
    private String department;

    @JsonProperty("semester")
    private Integer semester;

    @JsonProperty("address")
    private String address;

    @JsonProperty("parentPhone")
    private String parentPhone;

    @JsonProperty("parentEmail")
    private String parentEmail;
}





