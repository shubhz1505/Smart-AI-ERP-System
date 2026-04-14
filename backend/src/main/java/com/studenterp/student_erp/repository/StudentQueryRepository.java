package com.studenterp.repository;

import com.studenterp.entity.StudentQuery;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface StudentQueryRepository extends JpaRepository<StudentQuery, Long> {

    List<StudentQuery> findByStudentId(Long studentId);
    List<StudentQuery> findByEscalatedToAdmin(Boolean escalated);
    List<StudentQuery> findByAutoAnswered(Boolean autoAnswered);

    @Query("SELECT COUNT(q) FROM StudentQuery q WHERE q.autoAnswered = true")
    Long countAutoAnswered();

    @Query("SELECT COUNT(q) FROM StudentQuery q WHERE q.escalatedToAdmin = true")
    Long countEscalated();

    List<StudentQuery> findTop10ByOrderByCreatedAtDesc();

    @Query("SELECT q.intent, COUNT(q) FROM StudentQuery q GROUP BY q.intent")
    List<Object[]> countByIntent();
}