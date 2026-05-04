package com.studenterp.student_erp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class StudentErpApplication {
    public static void main(String[] args) {
        SpringApplication.run(StudentErpApplication.class, args);
    }
}
