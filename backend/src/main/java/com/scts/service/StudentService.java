package com.scts.service;

import com.scts.dto.*;
import com.scts.entity.*;
import com.scts.exception.ResourceNotFoundException;
import com.scts.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class StudentService {

    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final MembershipRepository membershipRepository;
    private final EventRegistrationRepository registrationRepository;
    private final AttendanceRepository attendanceRepository;
    private final VolunteerHourRepository volunteerHourRepository;
    private final AchievementRepository achievementRepository;
    private final CertificateRepository certificateRepository;

    @Autowired
    public StudentService(StudentRepository studentRepository, UserRepository userRepository, MembershipRepository membershipRepository, EventRegistrationRepository registrationRepository, AttendanceRepository attendanceRepository, VolunteerHourRepository volunteerHourRepository, AchievementRepository achievementRepository, CertificateRepository certificateRepository) {
        this.studentRepository = studentRepository;
        this.userRepository = userRepository;
        this.membershipRepository = membershipRepository;
        this.registrationRepository = registrationRepository;
        this.attendanceRepository = attendanceRepository;
        this.volunteerHourRepository = volunteerHourRepository;
        this.achievementRepository = achievementRepository;
        this.certificateRepository = certificateRepository;
    }

    public List<StudentDTO> getAllStudents() {
        return studentRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public StudentDTO getStudentById(Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", id));
        return mapToDTO(student);
    }

    @Transactional
    public StudentDTO getStudentByUserId(Long userId) {
        Student student = studentRepository.findByUserId(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

                    Student newStudent = Student.builder()
                            .user(user)
                            .name(user.getEmail() != null ? user.getEmail().split("@")[0] : "Student User")
                            .studentCode("STU" + (10000 + user.getId()))
                            .department("Computer Science & Engineering")
                            .degree("B.Tech")
                            .year(2)
                            .semester(4)
                            .contact("+91 9876543210")
                            .build();

                    return studentRepository.save(newStudent);
                });

        return mapToDTO(student);
    }

    @Transactional
    public StudentDTO updateStudentProfile(Long id, StudentDTO dto) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", id));

        student.setName(dto.getName());
        student.setDepartment(dto.getDepartment());
        student.setDegree(dto.getDegree());
        student.setYear(dto.getYear());
        student.setSemester(dto.getSemester());
        student.setLeetcode(dto.getLeetcode());
        student.setGithub(dto.getGithub());
        student.setHackerrank(dto.getHackerrank());
        student.setLinkedin(dto.getLinkedin());
        student.setCodechef(dto.getCodechef());
        student.setCustomLinks(dto.getCustomLinks());

        Student updated = studentRepository.save(student);
        return mapToDTO(updated);
    }

    public List<MembershipDTO> getStudentCommunities(Long studentId) {
        return membershipRepository.findByStudentId(studentId).stream()
                .filter(m -> m.getStatus() == MembershipStatus.APPROVED)
                .map(m -> MembershipDTO.builder()
                        .id(m.getId())
                        .studentId(m.getStudent().getId())
                        .communityId(m.getCommunity().getId())
                        .communityName(m.getCommunity().getName())
                        .communityCategory(m.getCommunity().getCategory())
                        .role(m.getRole())
                        .status(m.getStatus())
                        .build())
                .collect(Collectors.toList());
    }

    public List<ActivityDTO> getStudentActivities(Long studentId) {
        return registrationRepository.findByStudentId(studentId).stream()
                .map(r -> ActivityDTO.builder()
                        .id(r.getId())
                        .studentId(r.getStudent().getId())
                        .studentName(r.getStudent().getName())
                        .communityId(r.getEvent().getCommunity().getId())
                        .communityName(r.getEvent().getCommunity().getName())
                        .eventId(r.getEvent().getId())
                        .eventTitle(r.getEvent().getTitle())
                        .activityType("EVENT_REGISTERED")
                        .role(r.getStatus() != null ? r.getStatus() : "REGISTERED")
                        .contribution("Registered for " + ("GLOBAL_EVENT".equalsIgnoreCase(r.getEvent().getEventScope()) ? "Global Campus Event" : "Community Event") + " (+1 Point awarded)")
                        .activityDate(r.getRegistrationDate() != null ? r.getRegistrationDate().toLocalDate() : r.getEvent().getEventDate())
                        .description("Venue: " + r.getEvent().getVenue() + " | Date: " + r.getEvent().getEventDate() + " (" + r.getEvent().getTime() + ")")
                        .build())
                .collect(Collectors.toList());
    }

    public List<AchievementDTO> getStudentAchievements(Long studentId) {
        return List.of();
    }

    public List<CertificateDTO> getStudentCertificates(Long studentId) {
        return List.of();
    }

    private StudentDTO mapToDTO(Student s) {
        int joinedCommCount = (int) membershipRepository.findByStudentId(s.getId()).stream()
                .filter(m -> m.getStatus() == MembershipStatus.APPROVED).count();

        int eventsRegCount = (int) registrationRepository.countByStudentId(s.getId());
        double volunteerHoursSum = volunteerHourRepository.findByStudentId(s.getId()).stream()
                .mapToDouble(vh -> vh.getHours() != null ? vh.getHours() : 0.0).sum();

        List<MembershipDTO> mems = membershipRepository.findByStudentId(s.getId()).stream()
                .map(m -> MembershipDTO.builder()
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
                        .build())
                .collect(Collectors.toList());

        return StudentDTO.builder()
                .id(s.getId())
                .userId(s.getUser() != null ? s.getUser().getId() : null)
                .studentCode(s.getStudentCode())
                .name(s.getName())
                .department(s.getDepartment())
                .degree(s.getDegree())
                .year(s.getYear())
                .semester(s.getSemester())
                .contact(s.getContact())
                .email(s.getUser() != null ? s.getUser().getEmail() : "student@scts.edu")
                .totalCommunitiesJoined(joinedCommCount)
                .totalEventsRegistered(eventsRegCount)
                .totalEventsAttended(eventsRegCount)
                .totalVolunteerHours(volunteerHoursSum)
                .attendancePercentage(92.0)
                .memberships(mems)
                .leetcode(s.getLeetcode())
                .github(s.getGithub())
                .hackerrank(s.getHackerrank())
                .linkedin(s.getLinkedin())
                .codechef(s.getCodechef())
                .customLinks(s.getCustomLinks())
                .build();
    }
}
