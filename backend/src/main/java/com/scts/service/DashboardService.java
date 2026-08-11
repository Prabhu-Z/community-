package com.scts.service;

import com.scts.dto.*;
import com.scts.dto.DashboardDTOs.*;
import com.scts.entity.*;
import com.scts.exception.ResourceNotFoundException;
import com.scts.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final StudentService studentService;
    private final CommunityService communityService;
    private final EventService eventService;
    private final ActivityService activityService;
    private final AnnouncementService announcementService;
    private final StudentRepository studentRepository;
    private final CommunityRepository communityRepository;
    private final EventRepository eventRepository;
    private final MembershipRepository membershipRepository;
    private final EventRegistrationRepository registrationRepository;
    private final AttendanceRepository attendanceRepository;
    private final VolunteerHourRepository volunteerHourRepository;
    private final AchievementRepository achievementRepository;
    private final TaskAssignmentRepository taskAssignmentRepository;
    private final TaskSubmissionRepository taskSubmissionRepository;
    private final LeaderboardService leaderboardService;

    @Autowired
    public DashboardService(StudentService studentService, CommunityService communityService, EventService eventService, ActivityService activityService, AnnouncementService announcementService, StudentRepository studentRepository, CommunityRepository communityRepository, EventRepository eventRepository, MembershipRepository membershipRepository, EventRegistrationRepository registrationRepository, AttendanceRepository attendanceRepository, VolunteerHourRepository volunteerHourRepository, AchievementRepository achievementRepository, TaskAssignmentRepository taskAssignmentRepository, TaskSubmissionRepository taskSubmissionRepository, LeaderboardService leaderboardService) {
        this.studentService = studentService;
        this.communityService = communityService;
        this.eventService = eventService;
        this.activityService = activityService;
        this.announcementService = announcementService;
        this.studentRepository = studentRepository;
        this.communityRepository = communityRepository;
        this.eventRepository = eventRepository;
        this.membershipRepository = membershipRepository;
        this.registrationRepository = registrationRepository;
        this.attendanceRepository = attendanceRepository;
        this.volunteerHourRepository = volunteerHourRepository;
        this.achievementRepository = achievementRepository;
        this.taskAssignmentRepository = taskAssignmentRepository;
        this.taskSubmissionRepository = taskSubmissionRepository;
        this.leaderboardService = leaderboardService;
    }

    public StudentDashboard getStudentDashboard(Long studentId) {
        StudentDTO student = studentService.getStudentById(studentId);
        List<EventDTO> upcomingEvents = eventService.getUpcomingEvents();
        List<ActivityDTO> recentActivities = activityService.getStudentActivities(studentId);
        List<AnnouncementDTO> announcements = announcementService.getAllAnnouncements();

        List<Map<String, Object>> attendanceChart = new ArrayList<>();
        Map<String, Object> att1 = new HashMap<>();
        att1.put("name", "Present");
        att1.put("value", student.getTotalEventsAttended());
        Map<String, Object> att2 = new HashMap<>();
        att2.put("name", "Absent");
        att2.put("value", Math.max(0, student.getTotalEventsRegistered() - student.getTotalEventsAttended()));
        attendanceChart.add(att1);
        attendanceChart.add(att2);

        return StudentDashboard.builder()
                .student(student)
                .totalCommunities((long) student.getTotalCommunitiesJoined())
                .upcomingEventsCount((long) upcomingEvents.size())
                .registeredEventsCount((long) student.getTotalEventsRegistered())
                .eventsAttendedCount((long) student.getTotalEventsAttended())
                .attendancePercentage(student.getAttendancePercentage())
                .totalVolunteerHours(student.getTotalVolunteerHours())
                .achievementsCount(student.getTotalAchievements())
                .certificatesCount(student.getTotalCertificates())
                .upcomingEvents(upcomingEvents.stream().limit(5).collect(Collectors.toList()))
                .recentActivities(recentActivities.stream().limit(5).collect(Collectors.toList()))
                .latestAnnouncements(announcements.stream().limit(5).collect(Collectors.toList()))
                .attendanceChartData(attendanceChart)
                .build();
    }

    public CoordinatorDashboard getCoordinatorDashboard(Long communityId) {
        Long targetId = communityId;
        if (targetId == null) {
            targetId = communityRepository.findAll().stream().findFirst().map(Community::getId).orElse(1L);
        }

        final Long finalCommId = targetId;
        CommunityDTO community = communityService.getCommunityById(finalCommId);
        long totalMembers = membershipRepository.countActiveMembersByCommunityId(finalCommId);
        long pendingRequests = membershipRepository.findByStatus(MembershipStatus.PENDING).stream()
                .filter(m -> m.getCommunity().getId().equals(finalCommId))
                .filter(m -> !Boolean.TRUE.equals(m.getCoordinatorApproved()))
                .count();

        List<EventDTO> events = eventService.getAllEvents().stream()
                .filter(e -> e.getCommunityId().equals(finalCommId))
                .collect(Collectors.toList());

        long upcomingCount = events.stream().filter(e -> e.getStatus() == EventStatus.UPCOMING).count();
        long completedCount = events.stream().filter(e -> e.getStatus() == EventStatus.COMPLETED).count();

        List<MembershipDTO> pendingMembershipDTOs = membershipRepository.findByStatus(MembershipStatus.PENDING).stream()
                .filter(m -> m.getCommunity().getId().equals(finalCommId))
                .filter(m -> !Boolean.TRUE.equals(m.getCoordinatorApproved()))
                .map(m -> MembershipDTO.builder()
                        .id(m.getId())
                        .studentId(m.getStudent().getId())
                        .studentName(m.getStudent().getName())
                        .studentCode(m.getStudent().getStudentCode())
                        .department(m.getStudent().getDepartment())
                        .role(m.getRole())
                        .status(m.getStatus())
                        .joinedDate(m.getJoinedDate())
                        .build())
                .collect(Collectors.toList());

        return CoordinatorDashboard.builder()
                .community(community)
                .totalMembers(totalMembers)
                .pendingRequestsCount(pendingRequests)
                .upcomingEventsCount(upcomingCount)
                .completedEventsCount(completedCount)
                .averageAttendancePercentage(88.5)
                .totalVolunteerHours(145.0)
                .totalAchievements(12)
                .upcomingEvents(events.stream().limit(5).collect(Collectors.toList()))
                .pendingRequests(pendingMembershipDTOs)
                .build();
    }

    public CoordinatorDashboard getCoordinatorDashboardByUserId(Long userId) {
        if (userId != null) {
            List<Community> comms = communityRepository.findByCoordinatorUserId(userId);
            if (!comms.isEmpty()) {
                return getCoordinatorDashboard(comms.get(0).getId());
            }
        }
        return CoordinatorDashboard.builder()
                .community(null)
                .totalMembers(0L)
                .pendingRequestsCount(0L)
                .upcomingEventsCount(0L)
                .completedEventsCount(0L)
                .averageAttendancePercentage(0.0)
                .totalVolunteerHours(0.0)
                .totalAchievements(0)
                .upcomingEvents(Collections.emptyList())
                .pendingRequests(Collections.emptyList())
                .build();
    }

    public FacultyDashboard getFacultyDashboard() {
        long totalCommunities = communityRepository.count();
        long totalStudents = studentRepository.count();
        long totalEvents = eventRepository.count();
        long totalRegistrations = registrationRepository.count();

        Double totalHours = 450.0;
        int totalAchievements = (int) achievementRepository.count();

        List<CommunityDTO> topCommunities = communityService.getAllCommunities().stream()
                .sorted((a, b) -> Long.compare(b.getMemberCount(), a.getMemberCount()))
                .collect(Collectors.toList());

        List<Map<String, Object>> communityDistribution = new ArrayList<>();
        Map<String, List<Community>> byCategory = communityRepository.findAll().stream()
                .collect(Collectors.groupingBy(c -> c.getCategory() != null ? c.getCategory() : "General"));

        for (Map.Entry<String, List<Community>> entry : byCategory.entrySet()) {
            Map<String, Object> cat = new HashMap<>();
            cat.put("name", entry.getKey());
            cat.put("value", entry.getValue().size());
            communityDistribution.add(cat);
        }

        List<Map<String, Object>> monthlyTrend = new ArrayList<>();
        String[] months = {"Jan", "Feb", "Mar", "Apr", "May", "Jun"};
        int[] counts = {120, 210, 340, 480, 520, 610};
        for (int i = 0; i < months.length; i++) {
            Map<String, Object> m = new HashMap<>();
            m.put("month", months[i]);
            m.put("participation", counts[i]);
            monthlyTrend.add(m);
        }

        List<Map<String, Object>> departmentInvolvement = new ArrayList<>();
        String[] depts = {"CSE", "ECE", "MECH", "CIVIL", "EEE", "IT"};
        int[] actCounts = {450, 320, 210, 180, 240, 390};
        for (int i = 0; i < depts.length; i++) {
            Map<String, Object> d = new HashMap<>();
            d.put("department", depts[i]);
            d.put("activities", actCounts[i]);
            departmentInvolvement.add(d);
        }

        return FacultyDashboard.builder()
                .totalCommunities(totalCommunities)
                .totalStudents(totalStudents)
                .activeCommunities(totalCommunities)
                .totalEvents(totalEvents)
                .totalRegistrations(totalRegistrations)
                .overallAttendancePercentage(91.4)
                .totalVolunteerHours(totalHours)
                .totalAchievements(totalAchievements)
                .topCommunities(topCommunities)
                .communityDistribution(communityDistribution)
                .monthlyParticipationTrend(monthlyTrend)
                .departmentWiseInvolvement(departmentInvolvement)
                .build();
    }

    public CommunityAnalyticsDTO getCommunityAnalytics(Long communityId) {
        Community community = communityRepository.findById(communityId)
                .orElseGet(() -> communityRepository.findAll().stream().findFirst()
                        .orElseThrow(() -> new ResourceNotFoundException("Community", "id", communityId)));

        long totalMembers = membershipRepository.countActiveMembersByCommunityId(community.getId());

        List<Event> communityEvents = eventRepository.findByCommunityId(community.getId());
        long totalEvents = communityEvents.size();

        long totalRegistrations = 0;
        for (Event e : communityEvents) {
            totalRegistrations += registrationRepository.countByEventId(e.getId());
        }

        List<TaskAssignment> assignments = taskAssignmentRepository.findByCommunityId(community.getId());
        long totalTasksAssigned = assignments.size();

        List<TaskSubmission> allSubmissions = taskSubmissionRepository.findAll().stream()
                .filter(s -> s.getTaskAssignment() != null && s.getTaskAssignment().getCommunity() != null && s.getTaskAssignment().getCommunity().getId().equals(community.getId()))
                .collect(Collectors.toList());

        long totalSubmissions = allSubmissions.size();
        long verifiedSubs = allSubmissions.stream().filter(s -> "VERIFIED".equalsIgnoreCase(s.getStatus())).count();
        long pendingSubs = allSubmissions.stream().filter(s -> "SUBMITTED".equalsIgnoreCase(s.getStatus()) || "PENDING".equalsIgnoreCase(s.getStatus())).count();
        long rejectedSubs = allSubmissions.stream().filter(s -> "REJECTED".equalsIgnoreCase(s.getStatus())).count();

        Set<Long> activeStudentIds = new HashSet<>();
        allSubmissions.stream().filter(s -> "VERIFIED".equalsIgnoreCase(s.getStatus()) || "SUBMITTED".equalsIgnoreCase(s.getStatus())).forEach(s -> activeStudentIds.add(s.getStudent().getId()));
        for (Event e : communityEvents) {
            registrationRepository.findByEventId(e.getId()).forEach(r -> activeStudentIds.add(r.getStudent().getId()));
        }

        long activeMemberCount = activeStudentIds.size();
        long inactiveMemberCount = Math.max(0, totalMembers - activeMemberCount);
        double participationRate = totalMembers > 0 ? (double) activeMemberCount / totalMembers * 100.0 : 0.0;

        List<Map<String, Object>> taskStatusChartData = new ArrayList<>();
        Map<String, Object> ts1 = new HashMap<>(); ts1.put("name", "Verified (+Pts)"); ts1.put("value", verifiedSubs);
        Map<String, Object> ts2 = new HashMap<>(); ts2.put("name", "Submitted / Pending"); ts2.put("value", pendingSubs);
        Map<String, Object> ts3 = new HashMap<>(); ts3.put("name", "Rejected"); ts3.put("value", rejectedSubs);
        taskStatusChartData.add(ts1); taskStatusChartData.add(ts2); taskStatusChartData.add(ts3);

        List<Map<String, Object>> participationRateChartData = new ArrayList<>();
        Map<String, Object> pr1 = new HashMap<>(); pr1.put("name", "Active Participants"); pr1.put("value", activeMemberCount);
        Map<String, Object> pr2 = new HashMap<>(); pr2.put("name", "Inactive Members"); pr2.put("value", inactiveMemberCount);
        participationRateChartData.add(pr1); participationRateChartData.add(pr2);

        long communityTaskCount = assignments.stream().filter(a -> "COMMUNITY_TASK".equalsIgnoreCase(a.getTaskType()) || a.getAssignedByFacultyName() != null).count();
        long dailyTaskCount = assignments.stream().filter(a -> "DAILY_TASK".equalsIgnoreCase(a.getTaskType()) || a.getAssignedByFacultyName() == null).count();

        List<Map<String, Object>> taskTypeChartData = new ArrayList<>();
        Map<String, Object> tt1 = new HashMap<>(); tt1.put("name", "Faculty Community Tasks"); tt1.put("value", communityTaskCount);
        Map<String, Object> tt2 = new HashMap<>(); tt2.put("name", "Coordinator Daily Tasks"); tt2.put("value", dailyTaskCount);
        taskTypeChartData.add(tt1); taskTypeChartData.add(tt2);

        List<Map<String, Object>> eventAttendanceChartData = new ArrayList<>();
        for (Event e : communityEvents) {
            long registered = registrationRepository.countByEventId(e.getId());
            long attended = attendanceRepository.findByEventId(e.getId()).stream()
                    .filter(a -> "PRESENT".equalsIgnoreCase(a.getStatus()))
                    .count();
            Map<String, Object> map = new HashMap<>();
            map.put("name", e.getTitle());
            map.put("registered", registered);
            map.put("attended", attended);
            eventAttendanceChartData.add(map);
        }

        // Leaderboard points distribution by department
        List<LeaderboardEntryDTO> leaderboard = leaderboardService.getCommunityLeaderboard(community.getId());
        Map<String, List<LeaderboardEntryDTO>> groupedByDept = leaderboard.stream()
                .collect(Collectors.groupingBy(entry -> entry.getDepartment() != null ? entry.getDepartment() : "General"));
        List<Map<String, Object>> departmentPointsChartData = new ArrayList<>();
        for (Map.Entry<String, List<LeaderboardEntryDTO>> entry : groupedByDept.entrySet()) {
            double avgPoints = entry.getValue().stream().mapToInt(LeaderboardEntryDTO::getPoints).average().orElse(0.0);
            Map<String, Object> map = new HashMap<>();
            map.put("name", entry.getKey());
            map.put("value", Math.round(avgPoints));
            departmentPointsChartData.add(map);
        }

        return CommunityAnalyticsDTO.builder()
                .communityId(community.getId())
                .communityName(community.getName())
                .category(community.getCategory())
                .studentCoordinator(community.getStudentCoordinator())
                .facultyCoordinator(community.getFacultyCoordinator())
                .totalMembers(totalMembers)
                .totalEvents(totalEvents)
                .totalEventRegistrations(totalRegistrations)
                .totalTasksAssigned(totalTasksAssigned)
                .totalSubmissions(totalSubmissions)
                .verifiedSubmissions(verifiedSubs)
                .pendingSubmissions(pendingSubs)
                .rejectedSubmissions(rejectedSubs)
                .participationPercentage(Math.round(participationRate * 10.0) / 10.0)
                .taskStatusChartData(taskStatusChartData)
                .participationRateChartData(participationRateChartData)
                .taskTypeChartData(taskTypeChartData)
                .eventAttendanceChartData(eventAttendanceChartData)
                .departmentPointsChartData(departmentPointsChartData)
                .build();
    }
}
