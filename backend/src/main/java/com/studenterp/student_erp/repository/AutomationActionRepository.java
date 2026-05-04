package com.studenterp.student_erp.repository;

import com.studenterp.student_erp.entity.AutomationAction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AutomationActionRepository extends JpaRepository<AutomationAction, Long> {

    List<AutomationAction> findByStudentId(Long studentId);
    List<AutomationAction> findByActionType(String actionType);

    @Query("SELECT COUNT(a) FROM AutomationAction a WHERE a.actionType = 'URGENT_REMINDER_SENT'")
    Long countUrgentReminders();

    @Query("SELECT COUNT(a) FROM AutomationAction a WHERE a.actionType = 'ATTENDANCE_WARNING'")
    Long countAttendanceWarnings();

    List<AutomationAction> findTop10ByOrderByCreatedAtDesc();

    @Query("SELECT COUNT(a) FROM AutomationAction a WHERE DATE(a.createdAt) = CURRENT_DATE")
    Long countTodayActions();
}





