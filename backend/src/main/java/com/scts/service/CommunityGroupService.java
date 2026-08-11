package com.scts.service;

import com.scts.dto.CommunityGroupDTO;
import com.scts.dto.CommunityGroupDTO.GroupMemberDTO;
import com.scts.entity.*;
import com.scts.exception.ResourceNotFoundException;
import com.scts.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.scts.security.UserPrincipal;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CommunityGroupService {

    private final CommunityGroupRepository groupRepository;
    private final CommunityGroupMemberRepository groupMemberRepository;
    private final CommunityRepository communityRepository;
    private final StudentRepository studentRepository;

    @Autowired
    public CommunityGroupService(CommunityGroupRepository groupRepository, CommunityGroupMemberRepository groupMemberRepository, CommunityRepository communityRepository, StudentRepository studentRepository) {
        this.groupRepository = groupRepository;
        this.groupMemberRepository = groupMemberRepository;
        this.communityRepository = communityRepository;
        this.studentRepository = studentRepository;
    }

    @Transactional
    public CommunityGroupDTO createGroup(Long communityId, Long leaderStudentId, String groupName, String description, Integer maxTeamSize) {
        Community community = communityRepository.findById(communityId)
                .orElseThrow(() -> new ResourceNotFoundException("Community", "id", communityId));

        Student leader = studentRepository.findById(leaderStudentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", leaderStudentId));

        int capacity = (maxTeamSize != null && maxTeamSize > 0) ? maxTeamSize : 5;

        CommunityGroup group = new CommunityGroup();
        group.setGroupName(groupName);
        group.setDescription(description);
        group.setMaxTeamSize(capacity);
        group.setCommunity(community);
        group.setLeaderStudent(leader);
        group.setStatus("PENDING");
        group.setApprovalStatus("PENDING");
        group.setCreatedAt(LocalDateTime.now());

        CommunityGroup savedGroup = groupRepository.save(group);

        // Auto-add leader as LEADER member of the group
        CommunityGroupMember leaderMember = new CommunityGroupMember();
        leaderMember.setGroup(savedGroup);
        leaderMember.setStudent(leader);
        leaderMember.setRole("LEADER");
        leaderMember.setJoinedAt(LocalDateTime.now());
        groupMemberRepository.save(leaderMember);

        return mapToDTO(savedGroup);
    }

    public List<CommunityGroupDTO> getGroupsByCommunity(Long communityId) {
        List<CommunityGroup> groups = groupRepository.findByCommunityId(communityId);
        return groups.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public List<CommunityGroupDTO> getApprovedGroupsByCommunity(Long communityId) {
        List<CommunityGroup> groups = groupRepository.findByCommunityIdAndApprovalStatus(communityId, "APPROVED");
        return groups.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public List<CommunityGroupDTO> getPendingGroupsByCommunity(Long communityId) {
        List<CommunityGroup> groups = groupRepository.findByCommunityIdAndApprovalStatus(communityId, "PENDING");
        return groups.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Transactional
    public CommunityGroupDTO approveGroup(Long groupId) {
        CommunityGroup group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("CommunityGroup", "id", groupId));
        group.setApprovalStatus("APPROVED");
        group.setStatus("OPEN");
        CommunityGroup saved = groupRepository.save(group);
        return mapToDTO(saved);
    }

    @Transactional
    public CommunityGroupDTO declineGroup(Long groupId) {
        CommunityGroup group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("CommunityGroup", "id", groupId));
        group.setApprovalStatus("DECLINED");
        group.setStatus("DECLINED");
        CommunityGroup saved = groupRepository.save(group);
        return mapToDTO(saved);
    }

    public List<CommunityGroupDTO> getGroupsForStudent(Long studentId) {
        List<CommunityGroupMember> memberships = groupMemberRepository.findByStudentId(studentId);
        return memberships.stream()
                .map(m -> mapToDTO(m.getGroup()))
                .collect(Collectors.toList());
    }

    public CommunityGroupDTO getGroupById(Long groupId) {
        CommunityGroup group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("CommunityGroup", "id", groupId));
        return mapToDTO(group);
    }

    @Transactional
    public CommunityGroupDTO updateMaxTeamSize(Long groupId, Integer newMaxTeamSize) {
        CommunityGroup group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("CommunityGroup", "id", groupId));

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserPrincipal) {
            UserPrincipal userDetails = (UserPrincipal) authentication.getPrincipal();
            String role = userDetails.getAuthorities().stream()
                    .map(auth -> auth.getAuthority())
                    .findFirst()
                    .orElse("ROLE_STUDENT");
            if ("ROLE_STUDENT".equals(role)) {
                throw new IllegalArgumentException("Only faculty coordinators can modify team capacity.");
            }
        }

        if (newMaxTeamSize != null && newMaxTeamSize > 0) {
            group.setMaxTeamSize(newMaxTeamSize);
            long memberCount = groupMemberRepository.findByGroupId(groupId).stream()
                    .filter(m -> !"PENDING".equalsIgnoreCase(m.getRole()))
                    .count();
            if (memberCount >= newMaxTeamSize) {
                group.setStatus("FULL");
            } else {
                group.setStatus("OPEN");
            }
            groupRepository.save(group);
        }

        return mapToDTO(group);
    }

    @Transactional
    public CommunityGroupDTO joinGroup(Long groupId, Long studentId) {
        CommunityGroup group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("CommunityGroup", "id", groupId));

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", studentId));

        if (group.getLeaderStudent() == null) {
            throw new IllegalArgumentException("This group doesn't have a leader.");
        }

        Optional<CommunityGroupMember> existing = groupMemberRepository.findByGroupIdAndStudentId(groupId, studentId);
        if (existing.isPresent()) {
            return mapToDTO(group); // Already joined or pending
        }

        long approvedCount = groupMemberRepository.findByGroupId(groupId).stream()
                .filter(m -> !"PENDING".equalsIgnoreCase(m.getRole()))
                .count();
        if (approvedCount >= group.getMaxTeamSize()) {
            throw new IllegalArgumentException("Cannot join. Team has reached its maximum size of " + group.getMaxTeamSize() + " members.");
        }

        CommunityGroupMember member = new CommunityGroupMember();
        member.setGroup(group);
        member.setStudent(student);
        member.setRole("PENDING"); // Save as pending request for Student Leader approval
        member.setJoinedAt(LocalDateTime.now());
        groupMemberRepository.save(member);

        return mapToDTO(group);
    }

    @Transactional
    public CommunityGroupDTO approveMember(Long groupId, Long studentId) {
        CommunityGroup group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("CommunityGroup", "id", groupId));

        CommunityGroupMember member = groupMemberRepository.findByGroupIdAndStudentId(groupId, studentId)
                .orElseThrow(() -> new IllegalArgumentException("No pending request found for student in this group."));

        if (!"PENDING".equalsIgnoreCase(member.getRole())) {
            return mapToDTO(group); // Already approved
        }

        long approvedCount = groupMemberRepository.findByGroupId(groupId).stream()
                .filter(m -> !"PENDING".equalsIgnoreCase(m.getRole()))
                .count();

        if (approvedCount >= group.getMaxTeamSize()) {
            throw new IllegalArgumentException("Cannot approve. Team has reached its maximum size of " + group.getMaxTeamSize() + " members.");
        }

        member.setRole("MEMBER");
        groupMemberRepository.save(member);

        long updatedCount = approvedCount + 1;
        if (updatedCount >= group.getMaxTeamSize()) {
            group.setStatus("FULL");
            groupRepository.save(group);
        }

        return mapToDTO(group);
    }

    @Transactional
    public CommunityGroupDTO leaveGroup(Long groupId, Long studentId) {
        CommunityGroup group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("CommunityGroup", "id", groupId));

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", studentId));

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserPrincipal) {
            UserPrincipal userDetails = (UserPrincipal) authentication.getPrincipal();
            String role = userDetails.getAuthorities().stream()
                    .map(auth -> auth.getAuthority())
                    .findFirst()
                    .orElse("ROLE_STUDENT");
            
            if ("ROLE_STUDENT".equals(role)) {
                // If they are a student, they can only request to leave/decline for themselves.
                if (!student.getUser().getId().equals(userDetails.getId())) {
                    throw new IllegalArgumentException("Only faculty coordinators can remove other students from a group.");
                }
                
                // Block leaving if they are already joined members or leaders (not pending requests)
                Optional<CommunityGroupMember> memberOpt = groupMemberRepository.findByGroupIdAndStudentId(groupId, studentId);
                if (memberOpt.isPresent()) {
                    CommunityGroupMember member = memberOpt.get();
                    if ("MEMBER".equalsIgnoreCase(member.getRole()) || "LEADER".equalsIgnoreCase(member.getRole())) {
                        throw new IllegalArgumentException("Students are not allowed to leave groups. Please contact your Faculty Coordinator to request removal.");
                    }
                }
            }
        }

        if (group.getLeaderStudent() != null && group.getLeaderStudent().getId().equals(studentId)) {
            group.setLeaderStudent(null);
            groupRepository.save(group);
        }

        groupMemberRepository.deleteByGroupIdAndStudentId(groupId, studentId);

        long approvedCount = groupMemberRepository.findByGroupId(groupId).stream()
                .filter(m -> !"PENDING".equalsIgnoreCase(m.getRole()))
                .count();
        if (approvedCount < group.getMaxTeamSize()) {
            group.setStatus("OPEN");
            groupRepository.save(group);
        }

        return mapToDTO(group);
    }

    @Transactional
    public void deleteGroup(Long groupId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserPrincipal) {
            UserPrincipal userDetails = (UserPrincipal) authentication.getPrincipal();
            String role = userDetails.getAuthorities().stream()
                    .map(auth -> auth.getAuthority())
                    .findFirst()
                    .orElse("ROLE_STUDENT");
            
            if ("ROLE_STUDENT".equals(role)) {
                throw new IllegalArgumentException("Only faculty coordinators can dismantle a group.");
            }
        }

        List<CommunityGroupMember> members = groupMemberRepository.findByGroupId(groupId);
        groupMemberRepository.deleteAll(members);
        groupRepository.deleteById(groupId);
    }

    @Transactional
    public CommunityGroupDTO assignLeader(Long groupId, Long studentId) {
        CommunityGroup group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("CommunityGroup", "id", groupId));

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", studentId));

        // Demote old leader in memberships if any
        List<CommunityGroupMember> members = groupMemberRepository.findByGroupId(groupId);
        for (CommunityGroupMember m : members) {
            if ("LEADER".equalsIgnoreCase(m.getRole())) {
                m.setRole("MEMBER");
                groupMemberRepository.save(m);
            }
        }

        // Set new leader student reference
        group.setLeaderStudent(student);
        groupRepository.save(group);

        // Add or update new leader's membership in group
        Optional<CommunityGroupMember> existing = groupMemberRepository.findByGroupIdAndStudentId(groupId, studentId);
        if (existing.isPresent()) {
            CommunityGroupMember m = existing.get();
            m.setRole("LEADER");
            groupMemberRepository.save(m);
        } else {
            CommunityGroupMember leaderMember = new CommunityGroupMember();
            leaderMember.setGroup(group);
            leaderMember.setStudent(student);
            leaderMember.setRole("LEADER");
            leaderMember.setJoinedAt(LocalDateTime.now());
            groupMemberRepository.save(leaderMember);
        }

        return mapToDTO(group);
    }

    @Transactional
    public CommunityGroupDTO assignMember(Long groupId, Long studentId) {
        CommunityGroup group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("CommunityGroup", "id", groupId));

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", studentId));

        Optional<CommunityGroupMember> existing = groupMemberRepository.findByGroupIdAndStudentId(groupId, studentId);
        if (existing.isPresent()) {
            CommunityGroupMember m = existing.get();
            if ("PENDING".equalsIgnoreCase(m.getRole())) {
                m.setRole("MEMBER");
                groupMemberRepository.save(m);
            }
            return mapToDTO(group);
        }

        long approvedCount = groupMemberRepository.findByGroupId(groupId).stream()
                .filter(m -> !"PENDING".equalsIgnoreCase(m.getRole()))
                .count();
        if (approvedCount >= group.getMaxTeamSize()) {
            throw new IllegalArgumentException("Cannot assign. Team has reached its maximum size of " + group.getMaxTeamSize() + " members.");
        }

        CommunityGroupMember member = new CommunityGroupMember();
        member.setGroup(group);
        member.setStudent(student);
        member.setRole("MEMBER"); // Instantly approved member
        member.setJoinedAt(LocalDateTime.now());
        groupMemberRepository.save(member);

        long updatedCount = approvedCount + 1;
        if (updatedCount >= group.getMaxTeamSize()) {
            group.setStatus("FULL");
            groupRepository.save(group);
        }

        return mapToDTO(group);
    }

    private CommunityGroupDTO mapToDTO(CommunityGroup group) {
        List<CommunityGroupMember> members = groupMemberRepository.findByGroupId(group.getId());
        long approvedCount = members.stream()
                .filter(m -> !"PENDING".equalsIgnoreCase(m.getRole()))
                .count();

        List<GroupMemberDTO> memberDTOs = members.stream()
                .map(m -> new GroupMemberDTO(
                        m.getId(),
                        m.getStudent().getId(),
                        m.getStudent().getName(),
                        m.getStudent().getStudentCode(),
                        m.getStudent().getDepartment(),
                        m.getRole(),
                        m.getJoinedAt()
                ))
                .collect(Collectors.toList());

        CommunityGroupDTO dto = new CommunityGroupDTO();
        dto.setId(group.getId());
        dto.setGroupName(group.getGroupName());
        dto.setDescription(group.getDescription());
        dto.setMaxTeamSize(group.getMaxTeamSize());
        dto.setCurrentMemberCount(approvedCount);
        dto.setCommunityId(group.getCommunity() != null ? group.getCommunity().getId() : null);
        dto.setCommunityName(group.getCommunity() != null ? group.getCommunity().getName() : null);

        if (group.getLeaderStudent() != null) {
            dto.setLeaderStudentId(group.getLeaderStudent().getId());
            dto.setLeaderStudentName(group.getLeaderStudent().getName());
            dto.setLeaderStudentCode(group.getLeaderStudent().getStudentCode());
            dto.setLeaderDepartment(group.getLeaderStudent().getDepartment());
        }

        dto.setStatus(group.getStatus());
        dto.setApprovalStatus(group.getApprovalStatus());
        dto.setCreatedAt(group.getCreatedAt());
        dto.setMembers(memberDTOs);

        return dto;
    }
}
