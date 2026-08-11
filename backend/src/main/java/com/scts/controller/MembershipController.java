package com.scts.controller;

import com.scts.dto.MembershipDTO;
import com.scts.entity.CommunityRole;
import com.scts.service.MembershipService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/memberships")
public class MembershipController {

    private final MembershipService membershipService;

    @Autowired
    public MembershipController(MembershipService membershipService) {
        this.membershipService = membershipService;
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<MembershipDTO>> getStudentMemberships(@PathVariable Long studentId) {
        return ResponseEntity.ok(membershipService.getStudentMemberships(studentId));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<MembershipDTO>> getStudentMembershipsByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(membershipService.getStudentMembershipsByUserId(userId));
    }

    @GetMapping("/pending")
    public ResponseEntity<List<MembershipDTO>> getPendingRequests() {
        return ResponseEntity.ok(membershipService.getPendingRequests());
    }

    @GetMapping("/admin/pending")
    public ResponseEntity<List<MembershipDTO>> getAdminPendingRequests() {
        return ResponseEntity.ok(membershipService.getAdminPendingRequests());
    }

    @GetMapping("/community/{communityId}/pending")
    public ResponseEntity<List<MembershipDTO>> getCommunityPendingRequests(@PathVariable Long communityId) {
        return ResponseEntity.ok(membershipService.getCommunityPendingRequests(communityId));
    }

    @GetMapping("/community/{communityId}")
    public ResponseEntity<List<MembershipDTO>> getCommunityMembers(@PathVariable Long communityId) {
        return ResponseEntity.ok(membershipService.getCommunityMembers(communityId));
    }

    @PostMapping
    public ResponseEntity<MembershipDTO> requestMembership(
            @RequestParam Long studentId,
            @RequestParam Long communityId,
            @RequestParam(required = false) CommunityRole role) {
        return ResponseEntity.ok(membershipService.requestMembership(studentId, communityId, role));
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<MembershipDTO> approveMembership(@PathVariable Long id) {
        return ResponseEntity.ok(membershipService.approveMembership(id));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<MembershipDTO> rejectMembership(@PathVariable Long id) {
        return ResponseEntity.ok(membershipService.rejectMembership(id));
    }

    @PutMapping("/{id}/assign-leader")
    public ResponseEntity<MembershipDTO> assignStudentLeader(@PathVariable Long id) {
        return ResponseEntity.ok(membershipService.assignStudentLeader(id));
    }

    @PutMapping("/{id}/dismiss-leader")
    public ResponseEntity<MembershipDTO> dismissStudentLeader(@PathVariable Long id) {
        return ResponseEntity.ok(membershipService.dismissStudentLeader(id));
    }

    @PutMapping("/{id}/move")
    public ResponseEntity<MembershipDTO> moveMembership(
            @PathVariable Long id,
            @RequestParam Long targetCommunityId) {
        return ResponseEntity.ok(membershipService.moveMembership(id, targetCommunityId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> removeMembership(@PathVariable Long id) {
        membershipService.removeMembership(id);
        return ResponseEntity.noContent().build();
    }
}
