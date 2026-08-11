package com.scts.repository;

import com.scts.entity.CollaborationRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CollaborationRequestRepository extends JpaRepository<CollaborationRequest, Long> {
    List<CollaborationRequest> findByTargetCommunityIdAndStatus(Long targetCommunityId, String status);
    List<CollaborationRequest> findByRequestingCommunityId(Long requestingCommunityId);
}
