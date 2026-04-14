package com.studenterp.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.studenterp.entity.Attendance;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class AttendanceMarkRequest {

    @JsonProperty("courseId")
    @NotNull(message = "Course ID is required")
    private Long courseId;

    @JsonProperty("date")
    @NotNull(message = "Date is required")
    private LocalDate date;

    @JsonProperty("attendanceList")
    @NotNull(message = "Attendance list is required")
    private List<AttendanceEntry> attendanceList;

    @Data
    public static class AttendanceEntry {
        @JsonProperty("studentId")
        private Long studentId;

        @JsonProperty("status")
        private Attendance.AttendanceStatus status;
    }
}