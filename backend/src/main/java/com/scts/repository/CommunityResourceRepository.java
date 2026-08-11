package com.scts.repository;

import com.scts.entity.CommunityResource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommunityResourceRepository extends JpaRepository<CommunityResource, Long> {
    List<CommunityResource> findByCommunityId(Long communityId);
    void deleteByCommunityId(Long communityId);
}
