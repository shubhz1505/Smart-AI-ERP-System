package com.studenterp.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CourseRequest {

    @JsonProperty("courseCode")
    @NotBlank(message = "Course code is required")
    private String courseCode;

    @JsonProperty("courseName")
    @NotBlank(message = "Course name is required")
    private String courseName;

    @JsonProperty("department")
    private String department;

    @JsonProperty("credits")
    private Integer credits;

    @JsonProperty("semester")
    private Integer semester;

    @JsonProperty("description")
    private String description;
}