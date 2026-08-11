package com.scts.service;

import com.scts.dto.CommunityDTO;
import com.scts.entity.Community;
import com.scts.entity.MembershipStatus;
import com.scts.exception.ResourceNotFoundException;
import com.scts.repository.CommunityRepository;
import com.scts.repository.EventRepository;
import com.scts.repository.MembershipRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CommunityService {

    private final CommunityRepository communityRepository;
    private final MembershipRepository membershipRepository;
    private final EventRepository eventRepository;

    @Autowired
    public CommunityService(CommunityRepository communityRepository, MembershipRepository membershipRepository, EventRepository eventRepository) {
        this.communityRepository = communityRepository;
        this.membershipRepository = membershipRepository;
        this.eventRepository = eventRepository;
    }

    public List<CommunityDTO> getAllCommunities() {
        return communityRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public CommunityDTO getCommunityById(Long id) {
        Community community = communityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Community", "id", id));
        return mapToDTO(community);
    }

    @Transactional
    public CommunityDTO createCommunity(CommunityDTO dto) {
        Community community = Community.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .category(dto.getCategory())
                .facultyCoordinator(dto.getFacultyCoordinator())
                .studentCoordinator(dto.getStudentCoordinator())
                .coordinatorUserId(dto.getCoordinatorUserId())
                .status(dto.getStatus() != null ? dto.getStatus() : "ACTIVE")
                .build();
        if (dto.getMaxSize() != null) {
            community.setMaxSize(dto.getMaxSize());
        }

        Community saved = communityRepository.save(community);
        return mapToDTO(saved);
    }

    @Transactional
    public CommunityDTO updateCommunity(Long id, CommunityDTO dto) {
        Community community = communityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Community", "id", id));

        if (dto.getName() != null) community.setName(dto.getName());
        if (dto.getDescription() != null) community.setDescription(dto.getDescription());
        if (dto.getCategory() != null) community.setCategory(dto.getCategory());
        if (dto.getFacultyCoordinator() != null) community.setFacultyCoordinator(dto.getFacultyCoordinator());
        if (dto.getStudentCoordinator() != null) community.setStudentCoordinator(dto.getStudentCoordinator());
        if (dto.getMaxSize() != null) community.setMaxSize(dto.getMaxSize());
        community.setCoordinatorUserId(dto.getCoordinatorUserId());
        if (dto.getStatus() != null) community.setStatus(dto.getStatus());

        Community updated = communityRepository.save(community);
        return mapToDTO(updated);
    }

    @Transactional
    public CommunityDTO removeCoordinator(Long id) {
        Community community = communityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Community", "id", id));

        community.setCoordinatorUserId(null);
        community.setFacultyCoordinator("Unassigned");
        community.setStudentCoordinator("Unassigned");

        Community updated = communityRepository.save(community);
        return mapToDTO(updated);
    }

    @Transactional
    public void deleteCommunity(Long id) {
        Community community = communityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Community", "id", id));

        communityRepository.deleteRegistrationsByCommunityId(id);
        communityRepository.deleteAttendanceByCommunityId(id);
        communityRepository.deleteEventsByCommunityId(id);
        communityRepository.deleteSubmissionsByCommunityId(id);
        communityRepository.deleteAssignmentsByCommunityId(id);
        communityRepository.deleteMembershipsByCommunityId(id);
        communityRepository.deleteActivityRequestsByCommunityId(id);
        communityRepository.deleteAnnouncementsByCommunityId(id);
        communityRepository.deleteResourcesByCommunityId(id);

        communityRepository.delete(community);
    }

    private CommunityDTO mapToDTO(Community c) {
        long approvedCount = membershipRepository.countByCommunityIdAndStatus(c.getId(), MembershipStatus.APPROVED);
        long activeCount = membershipRepository.countByCommunityIdAndStatus(c.getId(), MembershipStatus.ACTIVE);
        long memberCount = approvedCount + activeCount;
        int upcomingEventCount = eventRepository.findUpcomingEventsByCommunityId(c.getId()).size();

        return CommunityDTO.builder()
                .id(c.getId())
                .name(c.getName())
                .description(c.getDescription())
                .category(c.getCategory())
                .facultyCoordinator(c.getFacultyCoordinator())
                .studentCoordinator(c.getStudentCoordinator())
                .coordinatorUserId(c.getCoordinatorUserId())
                .maxSize(c.getMaxSize() != null ? c.getMaxSize() : 100)
                .status(c.getStatus())
                .memberCount(memberCount)
                .upcomingEventCount(upcomingEventCount)
                .build();
    }
}
