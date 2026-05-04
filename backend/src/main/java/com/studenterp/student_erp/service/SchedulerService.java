package com.studenterp.student_erp.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class SchedulerService {

    private final AutomationEngineService automationEngine;

    // Runs every day at 9:00 AM
    @Scheduled(cron = "0 0 9 * * ?")
    public void dailyFeeAutomation() {
        log.info("⏰ [{}] Running daily fee automation...", LocalDateTime.now());
        try {
            var result = automationEngine.runFeeAutomation();
            log.info("✅ Fee automation result: {}", result);
        } catch (Exception e) {
            log.error("❌ Fee automation failed: {}", e.getMessage());
        }
    }

    // Runs every day at 10:00 AM
    @Scheduled(cron = "0 0 10 * * ?")
    public void dailyAttendanceAutomation() {
        log.info("⏰ [{}] Running daily attendance automation...", LocalDateTime.now());
        try {
            var result = automationEngine.runAttendanceAutomation();
            log.info("✅ Attendance automation result: {}", result);
        } catch (Exception e) {
            log.error("❌ Attendance automation failed: {}", e.getMessage());
        }
    }
}





