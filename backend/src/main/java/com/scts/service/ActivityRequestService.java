package com.scts.service;

import com.scts.dto.ActivityRequestDTO;
import com.scts.entity.*;
import com.scts.exception.BadRequestException;
import com.scts.exception.ResourceNotFoundException;
import com.scts.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ActivityRequestService {

    private final ActivityRequestRepository activityRequestRepository;
    private final StudentRepository studentRepository;
    private final CommunityRepository communityRepository;
    private final MembershipRepository membershipRepository;
    private final NotificationService notificationService;

    @Autowired
    public ActivityRequestService(ActivityRequestRepository activityRequestRepository, StudentRepository studentRepository, CommunityRepository communityRepository, MembershipRepository membershipRepository, NotificationService notificationService) {
        this.activityRequestRepository = activityRequestRepository;
        this.studentRepository = studentRepository;
        this.communityRepository = communityRepository;
        this.membershipRepository = membershipRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public ActivityRequestDTO createActivityRequest(ActivityRequestDTO dto) {
        Student student = studentRepository.findById(dto.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", dto.getStudentId()));

        Community community = communityRepository.findById(dto.getCommunityId())
                .orElseThrow(() -> new ResourceNotFoundException("Community", "id", dto.getCommunityId()));

        // Enforce Prerequisite: Student MUST be an approved member of this community!
        boolean isApprovedMember = membershipRepository.findByCommunityIdAndStatus(community.getId(), MembershipStatus.APPROVED)
                .stream()
                .anyMatch(m -> m.getStudent().getId().equals(student.getId()));

        if (!isApprovedMember) {
            throw new BadRequestException("Activity Request Submission Restricted: You must be an approved member of " + community.getName() + " to submit individual achievement claims to its Coordinator.");
        }

        ActivityRequest request = ActivityRequest.builder()
                .student(student)
                .community(community)
                .title(dto.getTitle())
                .category(dto.getCategory() != null ? dto.getCategory() : "OTHER")
                .description(dto.getDescription())
                .proofLink(dto.getProofLink())
                .proofFileName(dto.getProofFileName())
                .requestedPoints(dto.getRequestedPoints() != null ? dto.getRequestedPoints() : 5)
                .grantedPoints(0)
                .status("PENDING")
                .build();

        ActivityRequest saved = activityRequestRepository.save(request);

        // Notify Coordinator
        if (community.getCoordinatorUserId() != null) {
            notificationService.createNotification(
                    community.getCoordinatorUserId(),
                    "New Achievement Activity Claim!",
                    "Student " + student.getName() + " submitted an individual achievement claim: '" + dto.getTitle() + "' for point evaluation.",
                    "ACTIVITY_REQUEST"
            );
        }

        return mapToDTO(saved);
    }

    public List<ActivityRequestDTO> getRequestsByStudent(Long studentId) {
        return activityRequestRepository.findByStudentId(studentId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<ActivityRequestDTO> getRequestsByCommunity(Long communityId) {
        if (communityId != null) {
            return activityRequestRepository.findByCommunityId(communityId).stream()
                    .map(this::mapToDTO)
                    .collect(Collectors.toList());
        }
        return activityRequestRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public ActivityRequestDTO approveActivityRequest(Long id, Integer points, String feedback) {
        ActivityRequest request = activityRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ActivityRequest", "id", id));

        int ptsToGrant = (points != null && points > 0) ? points : (request.getRequestedPoints() != null ? request.getRequestedPoints() : 5);

        request.setStatus("APPROVED");
        request.setGrantedPoints(ptsToGrant);
        request.setCoordinatorFeedback(feedback != null ? feedback : "Approved & points awarded by Coordinator.");

        ActivityRequest updated = activityRequestRepository.save(request);

        // Award points to Student object
        Student student = updated.getStudent();
        if (student != null) {
            int currentPts = student.getPoints() != null ? student.getPoints() : 0;
            student.setPoints(currentPts + ptsToGrant);
            studentRepository.save(student);
        }

        // Notify Student
        if (updated.getStudent() != null && updated.getStudent().getUser() != null) {
            notificationService.createNotification(
                    updated.getStudent().getUser().getId(),
                    "🎉 Achievement Activity Claim Approved! (+" + ptsToGrant + " Pts)",
                    "Your achievement claim '" + updated.getTitle() + "' was approved by " + updated.getCommunity().getName() + " Coordinator! +" + ptsToGrant + " Points granted.",
                    "ACTIVITY_REQUEST"
            );
        }

        return mapToDTO(updated);
    }

    @Transactional
    public ActivityRequestDTO rejectActivityRequest(Long id, String feedback) {
        ActivityRequest request = activityRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ActivityRequest", "id", id));

        request.setStatus("REJECTED");
        request.setGrantedPoints(0);
        request.setCoordinatorFeedback(feedback != null ? feedback : "Declined by Coordinator.");

        ActivityRequest updated = activityRequestRepository.save(request);

        // Notify Student
        if (updated.getStudent() != null && updated.getStudent().getUser() != null) {
            notificationService.createNotification(
                    updated.getStudent().getUser().getId(),
                    "Activity Request Update",
                    "Your achievement claim '" + updated.getTitle() + "' was reviewed: " + (feedback != null ? feedback : "Declined by Coordinator."),
                    "ACTIVITY_REQUEST"
            );
        }

        return mapToDTO(updated);
    }

    private ActivityRequestDTO mapToDTO(ActivityRequest r) {
        return ActivityRequestDTO.builder()
                .id(r.getId())
                .studentId(r.getStudent().getId())
                .studentName(r.getStudent().getName())
                .studentCode(r.getStudent().getStudentCode())
                .department(r.getStudent().getDepartment())
                .communityId(r.getCommunity().getId())
                .communityName(r.getCommunity().getName())
                .title(r.getTitle())
                .category(r.getCategory())
                .description(r.getDescription())
                .proofLink(r.getProofLink())
                .proofFileName(r.getProofFileName())
                .requestedPoints(r.getRequestedPoints())
                .grantedPoints(r.getGrantedPoints())
                .status(r.getStatus())
                .coordinatorFeedback(r.getCoordinatorFeedback())
                .createdAt(r.getCreatedAt())
                .build();
    }
}
