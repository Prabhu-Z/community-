package com.scts.controller;

import com.scts.dto.BulkImportResultDTO;
import com.scts.entity.Community;
import com.scts.entity.Role;
import com.scts.entity.User;
import com.scts.repository.CommunityRepository;
import com.scts.repository.UserRepository;
import com.scts.service.FacultyImportService;
import com.scts.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;
    private final CommunityRepository communityRepository;
    private final NotificationService notificationService;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    private FacultyImportService facultyImportService;

    @Autowired
    public UserController(UserRepository userRepository, CommunityRepository communityRepository, NotificationService notificationService, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.communityRepository = communityRepository;
        this.notificationService = notificationService;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping("/coordinators")
    public ResponseEntity<List<User>> getCoordinators() {
        List<User> staffList = new ArrayList<>(userRepository.findByRole(Role.ROLE_COMMUNITY_COORDINATOR));
        staffList.addAll(userRepository.findByRole(Role.ROLE_FACULTY));
        return ResponseEntity.ok(staffList);
    }

    @GetMapping("/all")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @PutMapping("/{userId}/reassign-community")
    public ResponseEntity<?> reassignCoordinatorCommunity(
            @PathVariable Long userId,
            @RequestParam(required = false) String newCommunityId) {

        Optional<User> optionalUser = userRepository.findById(userId);
        if (optionalUser.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "User not found."));
        }
        User user = optionalUser.get();

        Long parsedCommunityId = null;
        if (newCommunityId != null && !newCommunityId.trim().isEmpty() && !"null".equalsIgnoreCase(newCommunityId.trim())) {
            try {
                parsedCommunityId = Long.valueOf(newCommunityId.trim());
            } catch (NumberFormatException e) {
                parsedCommunityId = null;
            }
        }

        // 1. Clean Slate: Unassign user from all previous communities
        List<Community> existingCommunities = communityRepository.findAll();
        for (Community c : existingCommunities) {
            if (user.getId().equals(c.getCoordinatorUserId())) {
                c.setCoordinatorUserId(null);
                c.setFacultyCoordinator("Unassigned");
                c.setStudentCoordinator("Unassigned");
                communityRepository.save(c);
            }
        }

        // 2. Assign to new community if provided
        if (parsedCommunityId != null) {
            Optional<Community> newCommOpt = communityRepository.findById(parsedCommunityId);
            if (newCommOpt.isPresent()) {
                Community newComm = newCommOpt.get();
                newComm.setCoordinatorUserId(userId);
                newComm.setFacultyCoordinator(extractOnlyName(user));
                communityRepository.save(newComm);
            }
        }

        notificationService.createNotification(
                userId,
                "Community Assignment Updated",
                "Faculty has updated your assigned community. Previous community ties have been cleared.",
                "ROLE_CHANGE"
        );

        return ResponseEntity.ok(Map.of("message", "Successfully reassigned coordinator and cleared previous community ties."));
    }

    @PostMapping("/grant-coordinator")
    public ResponseEntity<?> grantCoordinatorAccess(@RequestBody Map<String, Object> payload) {
        String email = (String) payload.get("email");
        String name = (String) payload.get("name");
        
        Long communityId = null;
        Object rawCommId = payload.get("communityId");
        if (rawCommId != null && !rawCommId.toString().trim().isEmpty() && !"null".equalsIgnoreCase(rawCommId.toString().trim())) {
            try {
                communityId = Long.valueOf(rawCommId.toString().trim());
            } catch (NumberFormatException e) {
                communityId = null;
            }
        }

        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email address is required."));
        }

        email = email.trim().toLowerCase();
        Optional<User> optionalUser = userRepository.findByEmail(email);

        if (optionalUser.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "User not registered. Please ask the user to register an account first."));
        }

        User user = optionalUser.get();
        user.setRole(Role.ROLE_COMMUNITY_COORDINATOR);
        userRepository.save(user);

        // If assigning to a community, clear user from any other community first
        if (communityId != null) {
            List<Community> existingCommunities = communityRepository.findAll();
            for (Community c : existingCommunities) {
                if (user.getId().equals(c.getCoordinatorUserId())) {
                    c.setCoordinatorUserId(null);
                    c.setFacultyCoordinator("Unassigned");
                    c.setStudentCoordinator("Unassigned");
                    communityRepository.save(c);
                }
            }

            Optional<Community> optionalCommunity = communityRepository.findById(communityId);
            if (optionalCommunity.isPresent()) {
                Community community = optionalCommunity.get();
                community.setCoordinatorUserId(user.getId());
                community.setFacultyCoordinator(extractOnlyName(user));
                communityRepository.save(community);
            }
        }

        notificationService.createNotification(
                user.getId(),
                "Coordinator Access Granted!",
                "Faculty has granted you Community Coordinator access. You can now manage events, memberships, and activities.",
                "ROLE_CHANGE"
        );

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Successfully granted Coordinator access to " + email);
        response.put("userId", user.getId());
        response.put("email", user.getEmail());
        response.put("role", user.getRole().name());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/bulk-import-faculty")
    public ResponseEntity<?> bulkImportFaculty(@RequestParam("file") MultipartFile file) {
        try {
            BulkImportResultDTO result = facultyImportService.importFaculty(file);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error importing faculty coordinators: " + e.getMessage()));
        }
    }

    private String extractOnlyName(User u) {
        if (u == null) return "Unassigned";
        String email = u.getEmail();
        if (email != null && email.contains("@")) {
            String rawUsername = email.split("@")[0];
            String[] parts = rawUsername.split("\\.");
            StringBuilder sb = new StringBuilder();
            for (String part : parts) {
                if (!part.isEmpty()) {
                    sb.append(Character.toUpperCase(part.charAt(0)))
                      .append(part.substring(1))
                      .append(" ");
                }
            }
            return sb.toString().trim();
        }
        return email != null ? email : "Faculty Advisor";
    }
}
