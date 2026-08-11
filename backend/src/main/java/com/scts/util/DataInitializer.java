package com.scts.util;

import com.scts.entity.*;
import com.scts.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final CommunityRepository communityRepository;
    private final MembershipRepository membershipRepository;
    private final EventRepository eventRepository;
    private final EventRegistrationRepository registrationRepository;
    private final AttendanceRepository attendanceRepository;
    private final ActivityRepository activityRepository;
    private final VolunteerHourRepository volunteerHourRepository;
    private final AchievementRepository achievementRepository;
    private final CertificateRepository certificateRepository;
    private final AnnouncementRepository announcementRepository;
    private final NotificationRepository notificationRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    private jakarta.persistence.EntityManager entityManager;

    @Autowired
    public DataInitializer(UserRepository userRepository, StudentRepository studentRepository, CommunityRepository communityRepository, MembershipRepository membershipRepository, EventRepository eventRepository, EventRegistrationRepository registrationRepository, AttendanceRepository attendanceRepository, ActivityRepository activityRepository, VolunteerHourRepository volunteerHourRepository, AchievementRepository achievementRepository, CertificateRepository certificateRepository, AnnouncementRepository announcementRepository, NotificationRepository notificationRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.communityRepository = communityRepository;
        this.membershipRepository = membershipRepository;
        this.eventRepository = eventRepository;
        this.registrationRepository = registrationRepository;
        this.attendanceRepository = attendanceRepository;
        this.activityRepository = activityRepository;
        this.volunteerHourRepository = volunteerHourRepository;
        this.achievementRepository = achievementRepository;
        this.certificateRepository = certificateRepository;
        this.announcementRepository = announcementRepository;
        this.notificationRepository = notificationRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public void run(String... args) {
        try {
            try {
                org.hibernate.Session session = entityManager.unwrap(org.hibernate.Session.class);
                session.doWork(connection -> {
                    java.sql.DatabaseMetaData metaData = connection.getMetaData();
                    try (java.sql.ResultSet rs = metaData.getColumns(null, null, "users", "faculty_reg_number")) {
                        if (!rs.next()) {
                            try (java.sql.Statement stmt = connection.createStatement()) {
                                stmt.executeUpdate("ALTER TABLE users ADD COLUMN faculty_reg_number VARCHAR(100) DEFAULT NULL");
                                stmt.executeUpdate("ALTER TABLE users ADD COLUMN name VARCHAR(255) DEFAULT NULL");
                                stmt.executeUpdate("ALTER TABLE users ADD COLUMN department VARCHAR(255) DEFAULT NULL");
                            }
                        }
                    }
                    try (java.sql.Statement stmt = connection.createStatement()) {
                        stmt.executeUpdate("ALTER TABLE community_groups MODIFY COLUMN leader_student_id BIGINT NULL");
                    } catch (Exception ignored) {}
                });
            } catch (Exception e) {
                System.out.println("Metadata migration exception: " + e.getMessage());
            }

            // Remove legacy Dr. Rajeshwar / Dr. Rajeshwari coordinators from all database rows
            communityRepository.findAll().forEach(c -> {
                if (c.getFacultyCoordinator() != null && 
                    (c.getFacultyCoordinator().toLowerCase().contains("rajeshwar") || 
                     c.getFacultyCoordinator().toLowerCase().contains("rajeshwari"))) {
                    c.setFacultyCoordinator(null);
                    communityRepository.save(c);
                }
            });

            membershipRepository.findByStatus(MembershipStatus.REJECTED).forEach(m -> {
                try {
                    membershipRepository.delete(m);
                } catch (Exception ignored) {}
            });

            if (userRepository.count() > 0) {
                return;
            }

            System.out.println("Initializing SCTS Seed Data...");

            // 1. Create Default Users
            User studentUser = userRepository.save(User.builder()
                    .email("student@scts.edu")
                    .password(passwordEncoder.encode("password123"))
                    .role(Role.ROLE_STUDENT)
                    .status("ACTIVE")
                    .build());

            User coordinatorUser = userRepository.save(User.builder()
                    .email("coordinator@scts.edu")
                    .password(passwordEncoder.encode("password123"))
                    .role(Role.ROLE_COMMUNITY_COORDINATOR)
                    .status("ACTIVE")
                    .build());

            User facultyUser = userRepository.save(User.builder()
                    .email("faculty@scts.edu")
                    .password(passwordEncoder.encode("password123"))
                    .role(Role.ROLE_FACULTY)
                    .status("ACTIVE")
                    .build());

            // 2. Create Student Profile
            Student student = studentRepository.save(Student.builder()
                    .user(studentUser)
                    .studentCode("REG2026001")
                    .name("Arun Kumar")
                    .department("Computer Science & Engineering")
                    .degree("B.Tech CSE")
                    .year(3)
                    .semester(6)
                    .contact("+91 9876543210")
                    .build());

            // 3. Seed 30+ Communities
            String[] names = {
                "Algorithms & Competitive Coding Club", "Web Development Chapter", "AI & Data Science Society",
                "NSS Green Warriors", "Youth Red Cross Chapter", "Robotics & Automation Club",
                "IEEE Student Branch", "Cyber Security Guild", "Literary & Debating Society",
                "Fine Arts & Cultural Club", "Music & Choir Ensemble", "Drama & Theatre Guild",
                "Photography & Media Club", "Astronomy & Physics Club", "Entrepreneurship Cell (E-Cell)",
                "GDSC Campus Chapter", "ACM Student Chapter", "Rotaract Club",
                "NCC Army Wing", "Fitness & Yoga Society", "Chess & Strategy Guild",
                "E-Sports & Gaming Chapter", "Blockchain & FinTech Lab", "Aeromodelling Club",
                "Automotive SAE Club", "Biotech Innovators Guild", "Renewable Energy Society",
                "Language & Linguistics Club", "Social Impact & NGO Cell", "Design & UI/UX Studio"
            };

            String[] categories = {
                "Technical", "Technical", "Technical", "Social Service", "Social Service", "Technical",
                "Technical", "Technical", "Literary", "Cultural", "Cultural", "Cultural",
                "Media", "Science", "Innovation", "Technical", "Technical", "Social Service",
                "Defence", "Wellness", "Sports", "Gaming", "Technical", "Innovation",
                "Engineering", "Science", "Innovation", "Literary", "Social Service", "Design"
            };

            for (int i = 0; i < names.length; i++) {
                Community c = communityRepository.save(Community.builder()
                        .name(names[i])
                        .description("Official student organization dedicated to promoting excellence in " + names[i] + ".")
                        .category(categories[i])
                        .facultyCoordinator(null)
                        .studentCoordinator(i == 0 ? "Arun Kumar" : "Lead Coordinator " + (i + 1))
                        .coordinatorUserId(coordinatorUser.getId())
                        .status("ACTIVE")
                        .build());

                if (i < 3) {
                    membershipRepository.save(Membership.builder()
                            .student(student)
                            .community(c)
                            .role(i == 0 ? CommunityRole.PRESIDENT : CommunityRole.MEMBER)
                            .status(MembershipStatus.APPROVED)
                            .joinedDate(LocalDate.now().minusMonths(6 - i))
                            .build());
                }
            }

            Community mainComm = communityRepository.findAll().get(0);

            // 4. Seed Events
            Event event1 = eventRepository.save(Event.builder()
                    .community(mainComm)
                    .title("Annual Hackathon 2026")
                    .description("24-hour non-stop competitive hackathon.")
                    .eventType(EventType.COMPETITION)
                    .venue("Main Auditorium")
                    .eventDate(LocalDate.now().plusDays(10))
                    .time("09:00 AM")
                    .registrationDeadline(LocalDate.now().plusDays(8))
                    .maxParticipants(150)
                    .status(EventStatus.UPCOMING)
                    .coordinatorName("Arun Kumar")
                    .build());

            Event event2 = eventRepository.save(Event.builder()
                    .community(mainComm)
                    .title("Full Stack Web Architecture Bootcamp")
                    .description("Hands-on workshop on React 18, Spring Boot 3, and Cloud Deployment.")
                    .eventType(EventType.WORKSHOP)
                    .venue("CS Lab 4")
                    .eventDate(LocalDate.now().minusDays(15))
                    .time("10:00 AM")
                    .maxParticipants(80)
                    .status(EventStatus.COMPLETED)
                    .coordinatorName("Arun Kumar")
                    .build());

            // 5. Seed Event Registrations & Attendance
            registrationRepository.save(EventRegistration.builder()
                    .event(event1)
                    .student(student)
                    .status("REGISTERED")
                    .build());

            registrationRepository.save(EventRegistration.builder()
                    .event(event2)
                    .student(student)
                    .status("COMPLETED")
                    .build());

            attendanceRepository.save(Attendance.builder()
                    .event(event2)
                    .student(student)
                    .status("PRESENT")
                    .recordedTime(LocalDateTime.now().minusDays(15))
                    .build());

            // 6. Seed Activities & Timeline
            activityRepository.save(Activity.builder()
                    .student(student)
                    .community(mainComm)
                    .event(event2)
                    .activityType("WORKSHOP_ATTENDED")
                    .role("Participant")
                    .contribution("Built modern React frontend for live lab assignment")
                    .activityDate(LocalDate.now().minusDays(15))
                    .description("Completed 6-hour intensive web development bootcamp.")
                    .build());

            // 7. Seed Volunteer Hours
            volunteerHourRepository.save(VolunteerHour.builder()
                    .student(student)
                    .community(mainComm)
                    .activityName("NSS Green Campus Drive")
                    .hours(12.5)
                    .activityDate(LocalDate.now().minusDays(20))
                    .verificationStatus("VERIFIED")
                    .build());

            // 8. Seed Achievements & Certificates
            achievementRepository.save(Achievement.builder()
                    .student(student)
                    .community(mainComm)
                    .event(event2)
                    .title("1st Rank - Algorithmic Coding Challenge")
                    .achievementType("FIRST_PLACE")
                    .description("Awarded top honors among 120+ participants in campus coding sprint.")
                    .achievementDate(LocalDate.now().minusDays(14))
                    .build());

            certificateRepository.save(Certificate.builder()
                    .student(student)
                    .event(event2)
                    .certificateType("EXCELLENCE")
                    .fileName("Web_Architecture_Bootcamp_Certificate.pdf")
                    .filePath("uploads/certificates/sample.pdf")
                    .issuedDate(LocalDate.now().minusDays(14))
                    .build());

            // 9. Seed Announcements & Notifications
            announcementRepository.save(Announcement.builder()
                    .community(mainComm)
                    .title("Registration Open: Annual Hackathon 2026")
                    .content("Register early to secure your slot! Prizes worth 50,000 INR.")
                    .createdBy("Arun Kumar")
                    .publishedDate(LocalDateTime.now().minusDays(2))
                    .build());

            notificationRepository.save(Notification.builder()
                    .user(studentUser)
                    .title("Welcome to SCTS Portal!")
                    .message("Explore 30+ communities, register for events, and track your volunteer hours.")
                    .type("SYSTEM")
                    .isRead(false)
                    .build());

            System.out.println("SCTS Seed Data Successfully Loaded!");
        } catch (Exception e) {
            System.err.println("Notice: Seed initialization exception handled: " + e.getMessage());
        }
    }
}
