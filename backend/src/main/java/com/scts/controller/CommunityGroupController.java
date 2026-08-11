package com.scts.controller;

import com.scts.dto.CommunityGroupDTO;
import com.scts.service.CommunityGroupService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/community-groups")
@CrossOrigin(origins = "*")
public class CommunityGroupController {

    private final CommunityGroupService groupService;

    @Autowired
    public CommunityGroupController(CommunityGroupService groupService) {
        this.groupService = groupService;
    }

    @PostMapping
    public ResponseEntity<CommunityGroupDTO> createGroup(@RequestBody Map<String, Object> payload) {
        Long communityId = payload.get("communityId") != null ? Long.valueOf(payload.get("communityId").toString()) : 1L;
        Long leaderStudentId = payload.get("leaderStudentId") != null ? Long.valueOf(payload.get("leaderStudentId").toString()) : 1L;
        String groupName = payload.get("groupName") != null ? payload.get("groupName").toString() : "Student Team";
        String description = payload.get("description") != null ? payload.get("description").toString() : "";
        Integer maxTeamSize = payload.get("maxTeamSize") != null ? Integer.valueOf(payload.get("maxTeamSize").toString()) : 5;

        CommunityGroupDTO dto = groupService.createGroup(communityId, leaderStudentId, groupName, description, maxTeamSize);
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/community/{communityId}")
    public ResponseEntity<List<CommunityGroupDTO>> getGroupsByCommunity(@PathVariable Long communityId) {
        return ResponseEntity.ok(groupService.getGroupsByCommunity(communityId));
    }

    @GetMapping("/community/{communityId}/approved")
    public ResponseEntity<List<CommunityGroupDTO>> getApprovedGroupsByCommunity(@PathVariable Long communityId) {
        return ResponseEntity.ok(groupService.getApprovedGroupsByCommunity(communityId));
    }

    @GetMapping("/community/{communityId}/pending")
    public ResponseEntity<List<CommunityGroupDTO>> getPendingGroupsByCommunity(@PathVariable Long communityId) {
        return ResponseEntity.ok(groupService.getPendingGroupsByCommunity(communityId));
    }

    @PutMapping("/{groupId}/approve")
    public ResponseEntity<CommunityGroupDTO> approveGroup(@PathVariable Long groupId) {
        return ResponseEntity.ok(groupService.approveGroup(groupId));
    }

    @PutMapping("/{groupId}/decline")
    public ResponseEntity<CommunityGroupDTO> declineGroup(@PathVariable Long groupId) {
        return ResponseEntity.ok(groupService.declineGroup(groupId));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<CommunityGroupDTO>> getGroupsForStudent(@PathVariable Long studentId) {
        return ResponseEntity.ok(groupService.getGroupsForStudent(studentId));
    }

    @GetMapping("/{groupId}")
    public ResponseEntity<CommunityGroupDTO> getGroupById(@PathVariable Long groupId) {
        return ResponseEntity.ok(groupService.getGroupById(groupId));
    }

    @PutMapping("/{groupId}/max-team-size")
    public ResponseEntity<CommunityGroupDTO> updateMaxTeamSize(
            @PathVariable Long groupId,
            @RequestParam Integer maxTeamSize) {
        return ResponseEntity.ok(groupService.updateMaxTeamSize(groupId, maxTeamSize));
    }

    @PostMapping("/{groupId}/join")
    public ResponseEntity<?> joinGroup(
            @PathVariable Long groupId,
            @RequestParam Long studentId) {
        try {
            CommunityGroupDTO dto = groupService.joinGroup(groupId, studentId);
            return ResponseEntity.ok(dto);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/{groupId}/approve-member")
    public ResponseEntity<?> approveMember(
            @PathVariable Long groupId,
            @RequestParam Long studentId) {
        try {
            CommunityGroupDTO dto = groupService.approveMember(groupId, studentId);
            return ResponseEntity.ok(dto);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/{groupId}/leave")
    public ResponseEntity<CommunityGroupDTO> leaveGroup(
            @PathVariable Long groupId,
            @RequestParam Long studentId) {
        return ResponseEntity.ok(groupService.leaveGroup(groupId, studentId));
    }

    @DeleteMapping("/{groupId}")
    public ResponseEntity<Void> deleteGroup(@PathVariable Long groupId) {
        groupService.deleteGroup(groupId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{groupId}/assign-leader")
    public ResponseEntity<?> assignLeader(
            @PathVariable Long groupId,
            @RequestParam Long studentId) {
        try {
            CommunityGroupDTO dto = groupService.assignLeader(groupId, studentId);
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/{groupId}/assign-member")
    public ResponseEntity<?> assignMember(
            @PathVariable Long groupId,
            @RequestParam Long studentId) {
        try {
            CommunityGroupDTO dto = groupService.assignMember(groupId, studentId);
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
