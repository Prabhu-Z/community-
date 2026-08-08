package com.scts.service;

import com.scts.dto.LeaderboardEntryDTO;
import com.scts.entity.ActivityRequest;
import com.scts.entity.EventRegistration;
import com.scts.entity.Membership;
import com.scts.entity.MembershipStatus;
import com.scts.entity.Student;
import com.scts.entity.TaskSubmission;
import com.scts.repository.ActivityRequestRepository;
import com.scts.repository.CommunityRepository;
import com.scts.repository.EventRegistrationRepository;
import com.scts.repository.MembershipRepository;
import com.scts.repository.StudentRepository;
import com.scts.repository.TaskSubmissionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class LeaderboardService {

    private final TaskSubmissionRepository taskSubmissionRepository;
    private final EventRegistrationRepository registrationRepository;
    private final MembershipRepository membershipRepository;
    private final CommunityRepository communityRepository;
    private final ActivityRequestRepository activityRequestRepository;
    private final StudentRepository studentRepository;

    @Autowired
    public LeaderboardService(TaskSubmissionRepository taskSubmissionRepository, EventRegistrationRepository registrationRepository, MembershipRepository membershipRepository, CommunityRepository communityRepository, ActivityRequestRepository activityRequestRepository, StudentRepository studentRepository) {
        this.taskSubmissionRepository = taskSubmissionRepository;
        this.registrationRepository = registrationRepository;
        this.membershipRepository = membershipRepository;
        this.communityRepository = communityRepository;
        this.activityRequestRepository = activityRequestRepository;
        this.studentRepository = studentRepository;
    }

    public List<LeaderboardEntryDTO> getCommunityLeaderboard(Long communityId) {
        List<Membership> activeMembers = membershipRepository.findByCommunityIdAndStatus(communityId, MembershipStatus.APPROVED);
        if (activeMembers == null || activeMembers.isEmpty()) {
            activeMembers = membershipRepository.findByCommunityId(communityId);
        }

        List<TaskSubmission> submissions = taskSubmissionRepository.findAll();
        List<EventRegistration> registrations = registrationRepository.findAll();
        List<ActivityRequest> activityRequests = activityRequestRepository.findByCommunityIdAndStatus(communityId, "APPROVED");

        Map<Long, Integer> studentPointsMap = new HashMap<>();

        // 1. Task Submissions Points (+3 Pts for Daily Task, +5 Pts for Community Task)
        for (TaskSubmission sub : submissions) {
            if ("VERIFIED".equalsIgnoreCase(sub.getStatus()) &&
                    sub.getTaskAssignment() != null &&
                    sub.getTaskAssignment().getCommunity() != null &&
                    sub.getTaskAssignment().getCommunity().getId().equals(communityId) &&
                    sub.getStudent() != null) {

                Long studentId = sub.getStudent().getId();
                String taskType = sub.getTaskAssignment().getTaskType();
                boolean isCommunityTask = "COMMUNITY_TASK".equalsIgnoreCase(taskType) || sub.getTaskAssignment().getAssignedByFacultyName() != null;

                int pts = isCommunityTask ? 5 : 3;
                studentPointsMap.put(studentId, studentPointsMap.getOrDefault(studentId, 0) + pts);
            }
        }

        // 2. Event Registrations Points (+1 Pt per Registered Event)
        for (EventRegistration reg : registrations) {
            if (reg.getEvent() != null &&
                    reg.getEvent().getCommunity() != null &&
                    reg.getEvent().getCommunity().getId().equals(communityId) &&
                    reg.getStudent() != null) {

                Long studentId = reg.getStudent().getId();
                studentPointsMap.put(studentId, studentPointsMap.getOrDefault(studentId, 0) + 1);
            }
        }

        // 3. Approved Individual Activity Claim Points (Granted by Coordinator)
        for (ActivityRequest req : activityRequests) {
            if (req.getStudent() != null) {
                Long studentId = req.getStudent().getId();
                int granted = req.getGrantedPoints() != null ? req.getGrantedPoints() : 0;
                studentPointsMap.put(studentId, studentPointsMap.getOrDefault(studentId, 0) + granted);
            }
        }

        String communityName = communityRepository.findById(communityId)
                .map(c -> c.getName())
                .orElse("Community");

        List<LeaderboardEntryDTO> entries = new ArrayList<>();
        Set<Long> processedStudentIds = new HashSet<>();

        if (activeMembers != null) {
            for (Membership m : activeMembers) {
                Student s = m.getStudent();
                if (s == null) continue;
                processedStudentIds.add(s.getId());

                int points = studentPointsMap.getOrDefault(s.getId(), 0);

                entries.add(LeaderboardEntryDTO.builder()
                        .studentId(s.getId())
                        .studentCode(s.getStudentCode())
                        .studentName(s.getName())
                        .department(s.getDepartment() != null ? s.getDepartment() : "General")
                        .points(points)
                        .communityId(communityId)
                        .communityName(communityName)
                        .build());
            }
        }

        // Fallback: If no specific community members exist, include all students from studentRepository
        if (entries.isEmpty()) {
            List<Student> allStudents = studentRepository.findAll();
            for (Student s : allStudents) {
                int points = studentPointsMap.getOrDefault(s.getId(), 0);
                entries.add(LeaderboardEntryDTO.builder()
                        .studentId(s.getId())
                        .studentCode(s.getStudentCode())
                        .studentName(s.getName())
                        .department(s.getDepartment() != null ? s.getDepartment() : "General")
                        .points(points)
                        .communityId(communityId)
                        .communityName(communityName)
                        .build());
            }
        }

        entries.sort((a, b) -> {
            int comp = Integer.compare(b.getPoints(), a.getPoints());
            if (comp != 0) return comp;
            return a.getStudentName().compareToIgnoreCase(b.getStudentName());
        });

        for (int i = 0; i < entries.size(); i++) {
            entries.get(i).setRank(i + 1);
        }

        return entries;
    }

    public List<LeaderboardEntryDTO> getAllCommunitiesLeaderboard() {
        List<Student> allStudents = studentRepository.findAll();
        List<TaskSubmission> submissions = taskSubmissionRepository.findAll();
        List<EventRegistration> registrations = registrationRepository.findAll();
        List<ActivityRequest> activityRequests = activityRequestRepository.findAll().stream()
                .filter(r -> "APPROVED".equalsIgnoreCase(r.getStatus()))
                .collect(Collectors.toList());

        Map<Long, Integer> studentPointsMap = new HashMap<>();

        // Base points for each student
        for (Student s : allStudents) {
            studentPointsMap.put(s.getId(), 0);
        }

        // 1. Task Points
        for (TaskSubmission sub : submissions) {
            if ("VERIFIED".equalsIgnoreCase(sub.getStatus()) && sub.getStudent() != null) {
                Long sId = sub.getStudent().getId();
                String taskType = sub.getTaskAssignment() != null ? sub.getTaskAssignment().getTaskType() : null;
                boolean isCommunityTask = "COMMUNITY_TASK".equalsIgnoreCase(taskType) || (sub.getTaskAssignment() != null && sub.getTaskAssignment().getAssignedByFacultyName() != null);

                int pts = isCommunityTask ? 5 : 3;
                studentPointsMap.put(sId, studentPointsMap.getOrDefault(sId, 0) + pts);
            }
        }

        // 2. Event Registration Points
        for (EventRegistration reg : registrations) {
            if (reg.getStudent() != null) {
                Long sId = reg.getStudent().getId();
                studentPointsMap.put(sId, studentPointsMap.getOrDefault(sId, 0) + 1);
            }
        }

        // 3. Approved Individual Activity Claims
        for (ActivityRequest req : activityRequests) {
            if (req.getStudent() != null) {
                Long sId = req.getStudent().getId();
                int granted = req.getGrantedPoints() != null ? req.getGrantedPoints() : 0;
                studentPointsMap.put(sId, studentPointsMap.getOrDefault(sId, 0) + granted);
            }
        }

        List<LeaderboardEntryDTO> entries = new ArrayList<>();
        for (Student s : allStudents) {
            int totalPts = studentPointsMap.getOrDefault(s.getId(), 0);

            entries.add(LeaderboardEntryDTO.builder()
                    .studentId(s.getId())
                    .studentCode(s.getStudentCode())
                    .studentName(s.getName())
                    .department(s.getDepartment() != null ? s.getDepartment() : "General")
                    .points(totalPts)
                    .communityName("All Communities")
                    .build());
        }

        entries.sort((a, b) -> {
            int comp = Integer.compare(b.getPoints(), a.getPoints());
            if (comp != 0) return comp;
            return a.getStudentName().compareToIgnoreCase(b.getStudentName());
        });

        for (int i = 0; i < entries.size(); i++) {
            entries.get(i).setRank(i + 1);
        }

        return entries;
    }
}
