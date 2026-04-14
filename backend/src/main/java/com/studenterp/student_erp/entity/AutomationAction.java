package com.studenterp.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "automation_actions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AutomationAction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "student_id")
    private Long studentId;

    @Column(name = "action_type")
    private String actionType;

    @Column(name = "trigger_reason")
    private String triggerReason;

    @Column(name = "message_sent")
    private String messageSent;

    private String status;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        status = "completed";
    }
}