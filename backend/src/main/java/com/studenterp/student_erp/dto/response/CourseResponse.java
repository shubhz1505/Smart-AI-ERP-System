package com.studenterp.dto.response;

import com.studenterp.entity.Course;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseResponse {

    private Long id;
    private String courseCode;
    private String courseName;
    private String department;
    private Integer credits;
    private Integer semester;
    private String description;
    private LocalDateTime createdAt;

    public static CourseResponse fromEntity(Course course) {
        return CourseResponse.builder()
                .id(course.getId())
                .courseCode(course.getCourseCode())
                .courseName(course.getCourseName())
                .department(course.getDepartment())
                .credits(course.getCredits())
                .semester(course.getSemester())
                .description(course.getDescription())
                .createdAt(course.getCreatedAt())
                .build();
    }
}