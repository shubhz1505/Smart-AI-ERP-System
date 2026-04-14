package com.studenterp.student_erp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication(
		scanBasePackages = {"com.studenterp", "com.studenterp.student_erp"}
)
@EnableJpaRepositories(
		basePackages = "com.studenterp.repository",
		entityManagerFactoryRef = "entityManagerFactory"
)
@EnableScheduling
public class StudentErpApplication {

	public static void main(String[] args) {
		SpringApplication.run(StudentErpApplication.class, args);
	}
}