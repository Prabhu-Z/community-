package com.scts.service;

import com.scts.dto.*;
import com.scts.repository.*;
import com.scts.entity.*;
import com.scts.exception.ResourceNotFoundException;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class ReportService {

    private final StudentService studentService;
    private final CommunityService communityService;
    private final EventService eventService;

    private final StudentRepository studentRepository;
    private final CommunityRepository communityRepository;
    private final MembershipRepository membershipRepository;
    private final EventRegistrationRepository registrationRepository;
    private final AttendanceRepository attendanceRepository;
    private final TaskSubmissionRepository taskSubmissionRepository;
    private final VolunteerHourRepository volunteerHourRepository;

    @Autowired
    public ReportService(
            StudentService studentService,
            CommunityService communityService,
            EventService eventService,
            StudentRepository studentRepository,
            CommunityRepository communityRepository,
            MembershipRepository membershipRepository,
            EventRegistrationRepository registrationRepository,
            AttendanceRepository attendanceRepository,
            TaskSubmissionRepository taskSubmissionRepository,
            VolunteerHourRepository volunteerHourRepository) {
        this.studentService = studentService;
        this.communityService = communityService;
        this.eventService = eventService;
        this.studentRepository = studentRepository;
        this.communityRepository = communityRepository;
        this.membershipRepository = membershipRepository;
        this.registrationRepository = registrationRepository;
        this.attendanceRepository = attendanceRepository;
        this.taskSubmissionRepository = taskSubmissionRepository;
        this.volunteerHourRepository = volunteerHourRepository;
    }

    public Map<String, Object> generateStudentReport(Long studentId) {
        StudentDTO student = studentService.getStudentById(studentId);
        Map<String, Object> report = new HashMap<>();
        report.put("reportTitle", "Official Student Extracurricular Transcript");
        report.put("generatedAt", java.time.LocalDateTime.now().toString());
        report.put("student", student);
        report.put("memberships", student.getMemberships());
        report.put("activities", student.getActivities());
        report.put("achievements", student.getAchievements());
        report.put("certificates", student.getCertificates());
        report.put("summary", Map.of(
                "totalCommunities", student.getTotalCommunitiesJoined(),
                "attendanceRate", student.getAttendancePercentage() + "%",
                "volunteerHours", student.getTotalVolunteerHours(),
                "achievementsCount", student.getTotalAchievements()
        ));
        return report;
    }

    public Map<String, Object> generateCommunityReport(Long communityId) {
        CommunityDTO community = communityService.getCommunityById(communityId);
        Map<String, Object> report = new HashMap<>();
        report.put("reportTitle", "Annual Community Performance Report");
        report.put("generatedAt", java.time.LocalDateTime.now().toString());
        report.put("community", community);
        report.put("memberCount", community.getMemberCount());
        report.put("upcomingEvents", community.getUpcomingEventCount());
        return report;
    }

    public String getCommunityCsvReport(Long communityId) {
        StringBuilder csv = new StringBuilder();
        csv.append("\uFEFFStudent Name,Roll Number,Tasks Finished,Tasks Unfinished,Events Registered,Events Attended,Events Not Attended\n");
        
        List<Membership> memberships = membershipRepository.findByCommunityIdAndStatus(communityId, MembershipStatus.APPROVED);
        for (Membership m : memberships) {
            Student s = m.getStudent();
            Long sId = s.getId();
            
            // Tasks finished/unfinished
            List<TaskSubmission> subs = taskSubmissionRepository.findByStudentId(sId);
            long finishedTasks = subs.stream().filter(sub -> "VERIFIED".equalsIgnoreCase(sub.getStatus())).count();
            long unfinishedTasks = subs.stream().filter(sub -> !"VERIFIED".equalsIgnoreCase(sub.getStatus())).count();
            
            // Events registered
            List<EventRegistration> regs = registrationRepository.findByStudentId(sId);
            long registeredEvents = regs.size();
            
            // Events attended
            List<Attendance> atts = attendanceRepository.findByStudentId(sId);
            long attendedEvents = atts.stream().filter(a -> "PRESENT".equalsIgnoreCase(a.getStatus())).count();
            long missedEvents = Math.max(0, registeredEvents - attendedEvents);
            
            String name = s.getName() != null ? s.getName().replace("\"", "\"\"") : "";
            String code = s.getStudentCode() != null ? s.getStudentCode().replace("\"", "\"\"") : "";
            
            csv.append(String.format("\"%s\",\"%s\",%d,%d,%d,%d,%d\n", name, code, finishedTasks, unfinishedTasks, registeredEvents, attendedEvents, missedEvents));
        }
        return csv.toString();
    }

    public String getAllCommunitiesCsvReport() {
        StringBuilder csv = new StringBuilder();
        csv.append("\uFEFFStudent Name,Roll Number,Community,Tasks Finished,Tasks Unfinished,Events Registered,Events Attended,Events Not Attended\n");
        
        List<Community> communities = communityRepository.findAll();
        for (Community c : communities) {
            List<Membership> memberships = membershipRepository.findByCommunityIdAndStatus(c.getId(), MembershipStatus.APPROVED);
            for (Membership m : memberships) {
                Student s = m.getStudent();
                Long sId = s.getId();
                
                // Tasks finished/unfinished
                List<TaskSubmission> subs = taskSubmissionRepository.findByStudentId(sId);
                long finishedTasks = subs.stream().filter(sub -> "VERIFIED".equalsIgnoreCase(sub.getStatus())).count();
                long unfinishedTasks = subs.stream().filter(sub -> !"VERIFIED".equalsIgnoreCase(sub.getStatus())).count();
                
                // Events registered
                List<EventRegistration> regs = registrationRepository.findByStudentId(sId);
                long registeredEvents = regs.size();
                
                // Events attended
                List<Attendance> atts = attendanceRepository.findByStudentId(sId);
                long attendedEvents = atts.stream().filter(a -> "PRESENT".equalsIgnoreCase(a.getStatus())).count();
                long missedEvents = Math.max(0, registeredEvents - attendedEvents);
                
                String name = s.getName() != null ? s.getName().replace("\"", "\"\"") : "";
                String code = s.getStudentCode() != null ? s.getStudentCode().replace("\"", "\"\"") : "";
                String commName = c.getName() != null ? c.getName().replace("\"", "\"\"") : "";
                
                csv.append(String.format("\"%s\",\"%s\",\"%s\",%d,%d,%d,%d,%d\n", name, code, commName, finishedTasks, unfinishedTasks, registeredEvents, attendedEvents, missedEvents));
            }
        }
        return csv.toString();
    }

    public String getStudentCsvReport(Long studentId) {
        Student s = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", studentId));
        
        StringBuilder csv = new StringBuilder();
        csv.append("\uFEFF--- STUDENT GENERAL PROFILE ---\n");
        csv.append("Student Name,Roll Number,Department,Total Volunteer Hours,Attendance Percentage\n");
        
        // Fetch stats
        List<Membership> memberships = membershipRepository.findByStudentId(studentId);
        List<TaskSubmission> subs = taskSubmissionRepository.findByStudentId(studentId);
        
        List<EventRegistration> regs = registrationRepository.findByStudentId(studentId);
        List<Attendance> atts = attendanceRepository.findByStudentId(studentId);
        long attendedEvents = atts.stream().filter(a -> "PRESENT".equalsIgnoreCase(a.getStatus())).count();
        double attendancePercent = regs.isEmpty() ? 0.0 : ((double) attendedEvents / regs.size()) * 100;
        
        // Let's get total volunteer hours
        double volHours = volunteerHourRepository.findByStudentId(studentId).stream()
                .mapToDouble(vh -> vh.getHours() != null ? vh.getHours() : 0.0).sum();
        
        csv.append(String.format("\"%s\",\"%s\",\"%s\",%.2f,%.1f%%\n\n",
                s.getName() != null ? s.getName().replace("\"", "\"\"") : "",
                s.getStudentCode() != null ? s.getStudentCode().replace("\"", "\"\"") : "",
                s.getDepartment() != null ? s.getDepartment().replace("\"", "\"\"") : "",
                volHours,
                attendancePercent));
        
        csv.append("--- ENROLLED COMMUNITIES ---\n");
        csv.append("Community Name,Role,Status\n");
        for (Membership m : memberships) {
            csv.append(String.format("\"%s\",\"%s\",\"%s\"\n",
                    m.getCommunity().getName() != null ? m.getCommunity().getName().replace("\"", "\"\"") : "",
                    m.getRole(),
                    m.getStatus().toString()));
        }
        csv.append("\n");
        
        csv.append("--- EVENT ATTENDANCE LOGS ---\n");
        csv.append("Event Title,Community,Event Date,Attendance Status\n");
        for (EventRegistration reg : regs) {
            Event e = reg.getEvent();
            String status = atts.stream()
                    .filter(a -> a.getEvent().getId().equals(e.getId()))
                    .findFirst()
                    .map(Attendance::getStatus)
                    .orElse("ABSENT");
            csv.append(String.format("\"%s\",\"%s\",\"%s\",\"%s\"\n",
                    e.getTitle() != null ? e.getTitle().replace("\"", "\"\"") : "",
                    e.getCommunity().getName() != null ? e.getCommunity().getName().replace("\"", "\"\"") : "",
                    e.getEventDate(),
                    status));
        }
        csv.append("\n");
        
        csv.append("--- TASK SUBMISSIONS ---\n");
        csv.append("Task Title,Category,Status,Deadline,Submitted Date,Proof Link\n");
        for (TaskSubmission sub : subs) {
            TaskAssignment ta = sub.getTaskAssignment();
            csv.append(String.format("\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\"\n",
                    ta.getTitle() != null ? ta.getTitle().replace("\"", "\"\"") : "",
                    ta.getTaskType(),
                    sub.getStatus(),
                    ta.getDeadline(),
                    sub.getSubmittedAt() != null ? sub.getSubmittedAt().toString() : "N/A",
                    sub.getProofLink() != null ? sub.getProofLink().replace("\"", "\"\"") : "N/A"));
        }
        
        return csv.toString();
    }
}
