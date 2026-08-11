package com.scts.service;

import com.scts.dto.GroupedFacultyTaskDTO;
import com.scts.dto.TaskAssignmentDTO;
import com.scts.dto.TaskSubmissionDTO;
import com.scts.entity.*;
import com.scts.exception.ResourceNotFoundException;
import com.scts.exception.BadRequestException;
import com.scts.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class TaskService {

    private final TaskAssignmentRepository taskAssignmentRepository;
    private final TaskSubmissionRepository taskSubmissionRepository;
    private final CommunityRepository communityRepository;
    private final MembershipRepository membershipRepository;
    private final NotificationService notificationService;
    private final StudentRepository studentRepository;

    @Autowired
    public TaskService(TaskAssignmentRepository taskAssignmentRepository, TaskSubmissionRepository taskSubmissionRepository, CommunityRepository communityRepository, MembershipRepository membershipRepository, NotificationService notificationService, StudentRepository studentRepository) {
        this.taskAssignmentRepository = taskAssignmentRepository;
        this.taskSubmissionRepository = taskSubmissionRepository;
        this.communityRepository = communityRepository;
        this.membershipRepository = membershipRepository;
        this.notificationService = notificationService;
        this.studentRepository = studentRepository;
    }

    @Transactional
    public TaskAssignmentDTO createTaskAssignment(Long communityId, TaskAssignmentDTO dto) {
        Community community = communityRepository.findById(communityId)
                .orElseThrow(() -> new ResourceNotFoundException("Community", "id", communityId));

        TaskAssignment assignment = TaskAssignment.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .targetYear(dto.getTargetYear() != null ? dto.getTargetYear() : "ALL")
                .deadline(dto.getDeadline())
                .status(dto.getStatus() != null ? dto.getStatus() : "ASSIGNED")
                .taskType(dto.getTaskType() != null ? dto.getTaskType() : "DAILY_TASK")
                .assignedByFacultyName(dto.getAssignedByFacultyName())
                .community(community)
                .build();

        TaskAssignment saved = taskAssignmentRepository.save(assignment);
        int assignedCount = generateSubmissionsForTask(saved, communityId, dto.getTargetYear());

        TaskAssignmentDTO result = mapToAssignmentDTO(saved);
        result.setAssignedStudentCount(assignedCount);
        return result;
    }

    @Transactional
    public List<TaskAssignmentDTO> proposeFacultyTaskToAllCommunities(TaskAssignmentDTO dto, String facultyName) {
        List<Community> allCommunities = communityRepository.findAll();
        List<TaskAssignmentDTO> createdTasks = new ArrayList<>();

        for (Community comm : allCommunities) {
            TaskAssignment assignment = TaskAssignment.builder()
                    .title(dto.getTitle())
                    .description(dto.getDescription())
                    .targetYear(dto.getTargetYear() != null ? dto.getTargetYear() : "ALL")
                    .deadline(dto.getDeadline())
                    .status("PENDING")
                    .taskType("COMMUNITY_TASK")
                    .assignedByFacultyName(facultyName != null ? facultyName : "Faculty Office")
                    .community(comm)
                    .build();

            TaskAssignment saved = taskAssignmentRepository.save(assignment);

            if (comm.getCoordinatorUserId() != null) {
                notificationService.createNotification(
                        comm.getCoordinatorUserId(),
                        "🏛️ New Faculty Community Task Pending Review",
                        "Faculty (" + (facultyName != null ? facultyName : "Faculty Office") + ") proposed task: '" + saved.getTitle() + "'. Accept it to assign to your community students.",
                        "FACULTY_TASK"
                );
            }

            createdTasks.add(mapToAssignmentDTO(saved));
        }

        return createdTasks;
    }

    @Transactional
    public TaskAssignmentDTO acceptFacultyTask(Long taskAssignmentId) {
        TaskAssignment assignment = taskAssignmentRepository.findById(taskAssignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("TaskAssignment", "id", taskAssignmentId));

        assignment.setStatus("ASSIGNED");
        TaskAssignment saved = taskAssignmentRepository.save(assignment);

        int assignedCount = generateSubmissionsForTask(saved, saved.getCommunity().getId(), saved.getTargetYear());

        TaskAssignmentDTO dto = mapToAssignmentDTO(saved);
        dto.setAssignedStudentCount(assignedCount);
        return dto;
    }

    @Transactional
    public TaskAssignmentDTO submitTaskToAdmin(Long taskAssignmentId) {
        TaskAssignment assignment = taskAssignmentRepository.findById(taskAssignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("TaskAssignment", "id", taskAssignmentId));

        if (!"COMMUNITY_TASK".equalsIgnoreCase(assignment.getTaskType())) {
            throw new IllegalArgumentException("Only Faculty Community Tasks can be submitted to Admin.");
        }

        assignment.setStatus("COMPLETED");
        TaskAssignment saved = taskAssignmentRepository.save(assignment);

        if (saved.getCommunity() != null && saved.getCommunity().getCoordinatorUserId() != null) {
            notificationService.createNotification(
                    saved.getCommunity().getCoordinatorUserId(),
                    "🎉 Community Task Package Completed & Submitted to Admin!",
                    "Community task '" + saved.getTitle() + "' has been finalized and submitted to Faculty Admin.",
                    "FACULTY_TASK"
            );
        }

        return mapToAssignmentDTO(saved);
    }

    @Transactional
    public TaskAssignmentDTO rejectFacultyTask(Long taskAssignmentId) {
        TaskAssignment assignment = taskAssignmentRepository.findById(taskAssignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("TaskAssignment", "id", taskAssignmentId));

        assignment.setStatus("DECLINED");
        TaskAssignment saved = taskAssignmentRepository.save(assignment);
        return mapToAssignmentDTO(saved);
    }

    private int generateSubmissionsForTask(TaskAssignment assignment, Long communityId, String targetYear) {
        List<Membership> activeMemberships = membershipRepository.findByCommunityIdAndStatus(communityId, MembershipStatus.APPROVED);

        int assignedCount = 0;
        for (Membership m : activeMemberships) {
            Student student = m.getStudent();
            String studentYear = student.getYear() != null ? String.valueOf(student.getYear()) : "";

            boolean yearMatch = targetYear == null ||
                    targetYear.equalsIgnoreCase("ALL") ||
                    studentYear.toLowerCase().contains(targetYear.toLowerCase()) ||
                    targetYear.toLowerCase().contains(studentYear.toLowerCase());

            if (yearMatch) {
                TaskSubmission submission = TaskSubmission.builder()
                        .taskAssignment(assignment)
                        .student(student)
                        .status("PENDING")
                        .build();
                taskSubmissionRepository.save(submission);
                assignedCount++;

                notificationService.createNotification(
                        student.getUser().getId(),
                        "New Task Assigned!",
                        "Task: '" + assignment.getTitle() + "' (" + ("COMMUNITY_TASK".equalsIgnoreCase(assignment.getTaskType()) ? "Faculty Community Task (+5 Pts)" : "Coordinator Daily Task (+3 Pts)") + ") assigned in " + assignment.getCommunity().getName() + ". Deadline: " + assignment.getDeadline(),
                        "TASK"
                );
            }
        }
        return assignedCount;
    }

    public List<GroupedFacultyTaskDTO> getGroupedFacultyTasks() {
        List<TaskAssignment> all = taskAssignmentRepository.findAll().stream()
                .filter(t -> "COMMUNITY_TASK".equalsIgnoreCase(t.getTaskType()) ||
                        (t.getAssignedByFacultyName() != null && !t.getAssignedByFacultyName().trim().isEmpty()))
                .collect(Collectors.toList());

        Map<String, List<TaskAssignment>> grouped = all.stream()
                .collect(Collectors.groupingBy(TaskAssignment::getTitle));

        List<GroupedFacultyTaskDTO> result = new ArrayList<>();

        for (Map.Entry<String, List<TaskAssignment>> entry : grouped.entrySet()) {
            List<TaskAssignment> list = entry.getValue();
            if (list.isEmpty()) continue;

            TaskAssignment first = list.get(0);
            List<TaskAssignmentDTO> dtos = list.stream().map(this::mapToAssignmentDTO).collect(Collectors.toList());

            int acceptedCount = (int) dtos.stream()
                    .filter(d -> !"PENDING".equalsIgnoreCase(d.getStatus()) && !"DECLINED".equalsIgnoreCase(d.getStatus()))
                    .count();

            GroupedFacultyTaskDTO groupedDto = GroupedFacultyTaskDTO.builder()
                    .title(first.getTitle())
                    .description(first.getDescription())
                    .targetYear(first.getTargetYear())
                    .deadline(first.getDeadline())
                    .assignedByFacultyName(first.getAssignedByFacultyName())
                    .totalCommunitiesTargeted(list.size())
                    .acceptedCommunitiesCount(acceptedCount)
                    .communityAssignments(dtos)
                    .build();

            result.add(groupedDto);
        }

        return result;
    }

    public List<TaskAssignmentDTO> getAllFacultyTasks() {
        return taskAssignmentRepository.findAll().stream()
                .filter(t -> "COMMUNITY_TASK".equalsIgnoreCase(t.getTaskType()) ||
                        (t.getAssignedByFacultyName() != null && !t.getAssignedByFacultyName().trim().isEmpty()))
                .map(this::mapToAssignmentDTO)
                .collect(Collectors.toList());
    }

    public List<TaskAssignmentDTO> getCommunityTasks(Long communityId) {
        return taskAssignmentRepository.findByCommunityId(communityId).stream()
                .filter(a -> !"DECLINED".equalsIgnoreCase(a.getStatus()) && !"PENDING".equalsIgnoreCase(a.getStatus()))
                .map(this::mapToAssignmentDTO)
                .collect(Collectors.toList());
    }

    public List<TaskAssignmentDTO> getPendingFacultyTasksForCommunity(Long communityId) {
        return taskAssignmentRepository.findByCommunityIdAndStatus(communityId, "PENDING").stream()
                .filter(a -> "COMMUNITY_TASK".equalsIgnoreCase(a.getTaskType()) || a.getAssignedByFacultyName() != null)
                .map(this::mapToAssignmentDTO)
                .collect(Collectors.toList());
    }

    public List<TaskSubmissionDTO> getStudentTasks(Long studentId) {
        return taskSubmissionRepository.findByStudentId(studentId).stream()
                .filter(s -> s.getTaskAssignment() != null &&
                        ("ASSIGNED".equalsIgnoreCase(s.getTaskAssignment().getStatus()) ||
                         "COMPLETED".equalsIgnoreCase(s.getTaskAssignment().getStatus())))
                .map(this::mapToSubmissionDTO)
                .collect(Collectors.toList());
    }

    public List<TaskSubmissionDTO> getTaskSubmissions(Long taskAssignmentId) {
        return taskSubmissionRepository.findByTaskAssignmentId(taskAssignmentId).stream()
                .map(this::mapToSubmissionDTO)
                .collect(Collectors.toList());
    }

    private boolean isDeadlinePassed(String deadlineStr) {
        if (deadlineStr == null || deadlineStr.trim().isEmpty()) {
            return false;
        }
        try {
            String clean = deadlineStr.replace("T", " ").trim();
            if (clean.length() >= 16) {
                java.time.format.DateTimeFormatter formatter = java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
                java.time.LocalDateTime deadlineTime = java.time.LocalDateTime.parse(clean.substring(0, 16), formatter);
                return java.time.LocalDateTime.now().isAfter(deadlineTime);
            }
            if (clean.length() >= 10) {
                java.time.LocalDate deadlineDate = java.time.LocalDate.parse(clean.substring(0, 10));
                return java.time.LocalDate.now().isAfter(deadlineDate);
            }
        } catch (Exception e) {
            System.err.println("Error parsing task deadline: " + deadlineStr);
        }
        return false;
    }

    @Transactional
    public TaskSubmissionDTO submitTaskProof(Long submissionId, String proofLink, String proofFileName, String proofFileUrl) {
        TaskSubmission submission = taskSubmissionRepository.findById(submissionId)
                .orElseThrow(() -> new ResourceNotFoundException("TaskSubmission", "id", submissionId));

        if (submission.getTaskAssignment() != null) {
            String dl = submission.getTaskAssignment().getDeadline();
            if (isDeadlinePassed(dl)) {
                throw new BadRequestException("The submission deadline for this task has passed.");
            }
        }

        if ((proofLink == null || proofLink.trim().isEmpty()) &&
            (proofFileName == null || proofFileName.trim().isEmpty()) &&
            (proofFileUrl == null || proofFileUrl.trim().isEmpty())) {
            throw new IllegalArgumentException("Task submission failed: You must provide a Proof Link or upload a proof document/screenshot.");
        }

        submission.setProofLink(proofLink != null ? proofLink.trim() : null);
        submission.setProofFileName(proofFileName != null ? proofFileName.trim() : null);
        submission.setProofFileUrl(proofFileUrl != null ? proofFileUrl.trim() : null);
        submission.setStatus("SUBMITTED");
        submission.setSubmittedAt(LocalDateTime.now());

        TaskSubmission updated = taskSubmissionRepository.save(submission);
        return mapToSubmissionDTO(updated);
    }

    @Transactional
    public TaskSubmissionDTO verifySubmission(Long submissionId) {
        TaskSubmission submission = taskSubmissionRepository.findById(submissionId)
                .orElseThrow(() -> new ResourceNotFoundException("TaskSubmission", "id", submissionId));

        submission.setStatus("VERIFIED");
        submission.setRejectionReason(null);
        TaskSubmission updated = taskSubmissionRepository.save(submission);

        boolean isCommunityTask = "COMMUNITY_TASK".equalsIgnoreCase(submission.getTaskAssignment().getTaskType()) ||
                submission.getTaskAssignment().getAssignedByFacultyName() != null;
        int pts = isCommunityTask ? 5 : 3;

        Student student = submission.getStudent();
        if (student != null) {
            int currentPts = student.getPoints() != null ? student.getPoints() : 0;
            student.setPoints(currentPts + pts);
            studentRepository.save(student);
        }

        notificationService.createNotification(
                submission.getStudent().getUser().getId(),
                "Task Submission Verified! (+" + pts + " Pts)",
                "Your submission for '" + submission.getTaskAssignment().getTitle() + "' has been verified and approved by your coordinator (+" + pts + " Points awarded).",
                "TASK"
        );

        return mapToSubmissionDTO(updated);
    }

    @Transactional
    public TaskSubmissionDTO rejectSubmission(Long submissionId, String rejectionReason) {
        TaskSubmission submission = taskSubmissionRepository.findById(submissionId)
                .orElseThrow(() -> new ResourceNotFoundException("TaskSubmission", "id", submissionId));

        submission.setStatus("REJECTED");
        submission.setRejectionReason(rejectionReason != null ? rejectionReason : "Insufficient or invalid task proof.");
        TaskSubmission updated = taskSubmissionRepository.save(submission);

        notificationService.createNotification(
                submission.getStudent().getUser().getId(),
                "Task Submission Rejected",
                "Your submission for '" + submission.getTaskAssignment().getTitle() + "' was rejected. Reason: " + submission.getRejectionReason(),
                "TASK"
        );

        return mapToSubmissionDTO(updated);
    }

    private TaskAssignmentDTO mapToAssignmentDTO(TaskAssignment a) {
        List<TaskSubmission> subs = taskSubmissionRepository.findByTaskAssignmentId(a.getId());
        int totalSubs = subs.size();
        int verifiedSubs = (int) subs.stream().filter(s -> "VERIFIED".equalsIgnoreCase(s.getStatus())).count();

        return TaskAssignmentDTO.builder()
                .id(a.getId())
                .title(a.getTitle())
                .description(a.getDescription())
                .targetYear(a.getTargetYear())
                .deadline(a.getDeadline())
                .status(a.getStatus())
                .taskType(a.getTaskType())
                .assignedByFacultyName(a.getAssignedByFacultyName())
                .communityId(a.getCommunity().getId())
                .communityName(a.getCommunity().getName())
                .createdAt(a.getCreatedAt())
                .assignedStudentCount(totalSubs)
                .verifiedStudentCount(verifiedSubs)
                .build();
    }

    private TaskSubmissionDTO mapToSubmissionDTO(TaskSubmission s) {
        return TaskSubmissionDTO.builder()
                .id(s.getId())
                .taskAssignmentId(s.getTaskAssignment().getId())
                .taskTitle(s.getTaskAssignment().getTitle())
                .taskDescription(s.getTaskAssignment().getDescription())
                .targetYear(s.getTaskAssignment().getTargetYear())
                .deadline(s.getTaskAssignment().getDeadline())
                .communityName(s.getTaskAssignment().getCommunity().getName())
                .taskType(s.getTaskAssignment().getTaskType())
                .studentId(s.getStudent().getId())
                .studentName(s.getStudent().getName())
                .studentCode(s.getStudent().getStudentCode())
                .proofLink(s.getProofLink())
                .proofFileName(s.getProofFileName())
                .proofFileUrl(s.getProofFileUrl())
                .status(s.getStatus())
                .rejectionReason(s.getRejectionReason())
                .submittedAt(s.getSubmittedAt())
                .build();
    }
}
