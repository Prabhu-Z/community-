package com.scts.repository;

import com.scts.entity.GroupMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GroupMessageRepository extends JpaRepository<GroupMessage, Long> {
    List<GroupMessage> findByGroupIdOrderByTimestampAsc(Long groupId);
}
