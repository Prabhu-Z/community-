package com.scts.repository;

import com.scts.entity.EventRegistration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EventRegistrationRepository extends JpaRepository<EventRegistration, Long> {
    List<EventRegistration> findByStudentId(Long studentId);
    List<EventRegistration> findByEventId(Long eventId);
    boolean existsByEventIdAndStudentId(Long eventId, Long studentId);
    java.util.Optional<EventRegistration> findByEventIdAndStudentId(Long eventId, Long studentId);
    long countByEventId(Long eventId);
    long countByStudentId(Long studentId);
}
