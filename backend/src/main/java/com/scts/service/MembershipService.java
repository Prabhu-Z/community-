package com.scts.service;

import com.scts.dto.MembershipDTO;
import com.scts.entity.*;
import com.scts.exception.BadRequestException;
import com.scts.exception.ResourceNotFoundException;
import com.scts.repository.CommunityRepository;
import com.scts.repository.MembershipRepository;
import com.scts.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.scts.security.UserPrincipal;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import com.scts.repository.CommunityGroupRepository;
import com.scts.repository.CommunityGroupMemberRepository;

@Service
public class MembershipService {

    private final MembershipRepository membershipRepository;
    private final StudentRepository studentRepository;
    private final CommunityRepository communityRepository;
    private final NotificationService notificationService;
    private final CommunityGroupRepository groupRepository;
    private final CommunityGroupMemberRepository groupMemberRepository;

    @Autowired
    public MembershipService(
            MembershipRepository membershipRepository, 
            StudentRepository studentRepository, 
            CommunityRepository communityRepository, 
            NotificationService notificationService,
            CommunityGroupRepository groupRepository,
            CommunityGroupMemberRepository groupMemberRepository) {
        this.membershipRepository = membershipRepository;
        this.studentRepository = studentRepository;
        this.communityRepository = communityRepository;
        this.notificationService = notificationService;
        this.groupRepository = groupRepository;
        this.groupMemberRepository = groupMemberRepository;
    }

    public List<MembershipDTO> getStudentMemberships(Long studentId) {
        return membershipRepository.findByStudentId(studentId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<MembershipDTO> getStudentMembershipsByUserId(Long userId) {
        return studentRepository.findByUserId(userId)
                .map(s -> membershipRepository.findByStudentId(s.getId()).stream()
                        .map(this::mapToDTO)
                        .collect(Collectors.toList()))
                .orElse(List.of());
    }

    public List<MembershipDTO> getCommunityMembers(Long communityId) {
        return membershipRepository.findByCommunityId(communityId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<MembershipDTO> getPendingRequests() {
        return membershipRepository.findByStatus(MembershipStatus.PENDING).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<MembershipDTO> getAdminPendingRequests() {
        return membershipRepository.findByStatus(MembershipStatus.PENDING).stream()
                .filter(m -> !m.getAdminApproved())
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<MembershipDTO> getCommunityPendingRequests(Long communityId) {
        return membershipRepository.findByCommunityIdAndStatus(communityId, MembershipStatus.PENDING).stream()
                .filter(m -> !m.getCoordinatorApproved())
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public MembershipDTO requestMembership(Long studentId, Long communityId, CommunityRole role) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", studentId));
        Community community = communityRepository.findById(communityId)
                .orElseThrow(() -> new ResourceNotFoundException("Community", "id", communityId));

        if (student.getUser() != null && student.getUser().getRole() == Role.ROLE_COMMUNITY_COORDINATOR) {
            throw new BadRequestException("Community Coordinators are restricted to managing a single community and cannot join other communities.");
        }

        if (membershipRepository.findByStudentIdAndCommunityId(studentId, communityId).isPresent()) {
            throw new BadRequestException("Membership application already submitted.");
        }

        Membership membership = Membership.builder()
                .student(student)
                .community(community)
                .role(role != null ? role : CommunityRole.MEMBER)
                .status(MembershipStatus.PENDING)
                .build();

        Membership saved = membershipRepository.save(membership);
        return mapToDTO(saved);
    }

    @Transactional
    public MembershipDTO approveMembership(Long id) {
        Membership membership = membershipRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Membership", "id", id));

        // Determine who the approver is
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserPrincipal) {
            UserPrincipal userDetails = (UserPrincipal) authentication.getPrincipal();
            Role userRole = userDetails.getAuthorities().stream()
                    .map(auth -> auth.getAuthority())
                    .filter(auth -> auth.startsWith("ROLE_"))
                    .map(auth -> Role.valueOf(auth))
                    .findFirst()
                    .orElse(Role.ROLE_STUDENT);

            if (userRole == Role.ROLE_FACULTY) {
                membership.setAdminApproved(true);
            } else if (userRole == Role.ROLE_COMMUNITY_COORDINATOR) {
                membership.setCoordinatorApproved(true);
            } else {
                membership.setCoordinatorApproved(true);
                membership.setAdminApproved(true);
            }
        } else {
            membership.setCoordinatorApproved(true);
            membership.setAdminApproved(true);
        }

        if (membership.getCoordinatorApproved() && membership.getAdminApproved()) {
            membership.setStatus(MembershipStatus.APPROVED);
        } else {
            membership.setStatus(MembershipStatus.PENDING);
        }

        Membership updated = membershipRepository.save(membership);

        if (updated.getStatus() == MembershipStatus.APPROVED) {
            notificationService.createNotification(
                    membership.getStudent().getUser().getId(),
                    "Membership Approved!",
                    "Your application to join " + membership.getCommunity().getName() + " has been approved.",
                    "MEMBERSHIP"
            );
        } else {
            notificationService.createNotification(
                    membership.getStudent().getUser().getId(),
                    "Membership Request Update",
                    "Your application to join " + membership.getCommunity().getName() + " was approved by one coordinator and is pending the final approval.",
                    "MEMBERSHIP"
            );
        }

        return mapToDTO(updated);
    }

    @Transactional
    public MembershipDTO rejectMembership(Long id) {
        Membership membership = membershipRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Membership", "id", id));

        // Delete the membership record entirely so the student can re-apply!
        membershipRepository.delete(membership);

        notificationService.createNotification(
                membership.getStudent().getUser().getId(),
                "Membership Request Update",
                "Your application to join " + membership.getCommunity().getName() + " was not approved. You may submit a new request.",
                "MEMBERSHIP"
        );

        // Return a DTO representing the state before deletion, marked as REJECTED
        membership.setStatus(MembershipStatus.REJECTED);
        membership.setCoordinatorApproved(false);
        membership.setAdminApproved(false);
        return mapToDTO(membership);
    }

    @Transactional
    public MembershipDTO assignStudentLeader(Long id) {
        Membership membership = membershipRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Membership", "id", id));

        membership.setRole(CommunityRole.STUDENT_COORDINATOR);
        Membership updated = membershipRepository.save(membership);

        notificationService.createNotification(
                membership.getStudent().getUser().getId(),
                "Promoted to Student Leader!",
                "You have been assigned as a Student Leader for " + membership.getCommunity().getName() + ". You can now propose events to your coordinator!",
                "LEADERSHIP"
        );

        return mapToDTO(updated);
    }

    @Transactional
    public MembershipDTO dismissStudentLeader(Long id) {
        Membership membership = membershipRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Membership", "id", id));

        membership.setRole(CommunityRole.MEMBER);
        Membership updated = membershipRepository.save(membership);

        notificationService.createNotification(
                membership.getStudent().getUser().getId(),
                "Leadership Role Update",
                "Your Student Leader role for " + membership.getCommunity().getName() + " has been reset to Member.",
                "LEADERSHIP"
        );

        return mapToDTO(updated);
    }

    private void cleanupGroupMemberships(Long studentId, Long communityId) {
        try {
            List<CommunityGroup> groups = groupRepository.findByCommunityId(communityId);
            for (CommunityGroup group : groups) {
                if (group.getLeaderStudent() != null && group.getLeaderStudent().getId().equals(studentId)) {
                    group.setLeaderStudent(null);
                    groupRepository.save(group);
                }
                groupMemberRepository.deleteByGroupIdAndStudentId(group.getId(), studentId);
            }
        } catch (Exception ignored) {}
    }

    @Transactional
    public MembershipDTO moveMembership(Long id, Long targetCommunityId) {
        Membership membership = membershipRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Membership", "id", id));

        Community targetCommunity = communityRepository.findById(targetCommunityId)
                .orElseThrow(() -> new ResourceNotFoundException("Community", "id", targetCommunityId));

        Optional<Membership> existing = membershipRepository.findByStudentIdAndCommunityId(
                membership.getStudent().getId(), targetCommunityId);

        cleanupGroupMemberships(membership.getStudent().getId(), membership.getCommunity().getId());

        if (existing.isPresent()) {
            membershipRepository.delete(membership);
            Membership targetMem = existing.get();
            targetMem.setStatus(MembershipStatus.APPROVED);
            targetMem.setCoordinatorApproved(true);
            targetMem.setAdminApproved(true);
            Membership updated = membershipRepository.save(targetMem);
            
            notificationService.createNotification(
                    membership.getStudent().getUser().getId(),
                    "Community Transfer",
                    "You have been transferred from " + membership.getCommunity().getName() + " to " + targetCommunity.getName() + ".",
                    "MEMBERSHIP"
            );

            return mapToDTO(updated);
        } else {
            String oldCommunityName = membership.getCommunity().getName();
            membership.setCommunity(targetCommunity);
            membership.setStatus(MembershipStatus.APPROVED);
            membership.setCoordinatorApproved(true);
            membership.setAdminApproved(true);
            Membership updated = membershipRepository.save(membership);

            notificationService.createNotification(
                    membership.getStudent().getUser().getId(),
                    "Community Transfer",
                    "You have been transferred from " + oldCommunityName + " to " + targetCommunity.getName() + ".",
                    "MEMBERSHIP"
            );

            return mapToDTO(updated);
        }
    }

    @Transactional
    public void removeMembership(Long id) {
        Membership membership = membershipRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Membership", "id", id));

        cleanupGroupMemberships(membership.getStudent().getId(), membership.getCommunity().getId());
        
        membershipRepository.delete(membership);

        notificationService.createNotification(
                membership.getStudent().getUser().getId(),
                "Community Roster Update",
                "Your membership in " + membership.getCommunity().getName() + " has been removed by the coordinator.",
                "MEMBERSHIP"
        );
    }

    private MembershipDTO mapToDTO(Membership m) {
        return MembershipDTO.builder()
                .id(m.getId())
                .studentId(m.getStudent().getId())
                .studentName(m.getStudent().getName())
                .studentCode(m.getStudent().getStudentCode())
                .department(m.getStudent().getDepartment())
                .communityId(m.getCommunity().getId())
                .communityName(m.getCommunity().getName())
                .communityCategory(m.getCommunity().getCategory())
                .role(m.getRole())
                .status(m.getStatus())
                .joinedDate(m.getJoinedDate() != null ? m.getJoinedDate() : LocalDate.now())
                .coordinatorApproved(m.getCoordinatorApproved())
                .adminApproved(m.getAdminApproved())
                .build();
    }
}
