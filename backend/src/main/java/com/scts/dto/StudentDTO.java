package com.scts.dto;

import java.util.List;

public class StudentDTO {
    private Long id;
    private Long userId;
    private String studentCode;
    private String name;
    private String email;
    private String department;
    private String degree;
    private Integer year;
    private Integer semester;
    private String contact;
    private String profileImage;
    
    private Integer totalCommunitiesJoined;
    private Integer totalEventsRegistered;
    private Integer totalEventsAttended;
    private Double attendancePercentage;
    private Double totalVolunteerHours;
    private Integer totalAchievements;
    private Integer totalCertificates;

    private String leetcode;
    private String github;
    private String hackerrank;
    private String linkedin;
    private String codechef;
    private String customLinks;

    private List<MembershipDTO> memberships;
    private List<ActivityDTO> activities;
    private List<AchievementDTO> achievements;
    private List<CertificateDTO> certificates;

    public StudentDTO() {}

    public StudentDTO(Long id, Long userId, String studentCode, String name, String email, String department, String degree, Integer year, Integer semester, String contact, String profileImage, Integer totalCommunitiesJoined, Integer totalEventsRegistered, Integer totalEventsAttended, Double attendancePercentage, Double totalVolunteerHours, Integer totalAchievements, Integer totalCertificates, List<MembershipDTO> memberships, List<ActivityDTO> activities, List<AchievementDTO> achievements, List<CertificateDTO> certificates) {
        this.id = id;
        this.userId = userId;
        this.studentCode = studentCode;
        this.name = name;
        this.email = email;
        this.department = department;
        this.degree = degree;
        this.year = year;
        this.semester = semester;
        this.contact = contact;
        this.profileImage = profileImage;
        this.totalCommunitiesJoined = totalCommunitiesJoined;
        this.totalEventsRegistered = totalEventsRegistered;
        this.totalEventsAttended = totalEventsAttended;
        this.attendancePercentage = attendancePercentage;
        this.totalVolunteerHours = totalVolunteerHours;
        this.totalAchievements = totalAchievements;
        this.totalCertificates = totalCertificates;
        this.memberships = memberships;
        this.activities = activities;
        this.achievements = achievements;
        this.certificates = certificates;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getStudentCode() { return studentCode; }
    public void setStudentCode(String studentCode) { this.studentCode = studentCode; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public String getDegree() { return degree; }
    public void setDegree(String degree) { this.degree = degree; }
    public Integer getYear() { return year; }
    public void setYear(Integer year) { this.year = year; }
    public Integer getSemester() { return semester; }
    public void setSemester(Integer semester) { this.semester = semester; }
    public String getContact() { return contact; }
    public void setContact(String contact) { this.contact = contact; }
    public String getProfileImage() { return profileImage; }
    public void setProfileImage(String profileImage) { this.profileImage = profileImage; }
    public Integer getTotalCommunitiesJoined() { return totalCommunitiesJoined; }
    public void setTotalCommunitiesJoined(Integer totalCommunitiesJoined) { this.totalCommunitiesJoined = totalCommunitiesJoined; }
    public Integer getTotalEventsRegistered() { return totalEventsRegistered; }
    public void setTotalEventsRegistered(Integer totalEventsRegistered) { this.totalEventsRegistered = totalEventsRegistered; }
    public Integer getTotalEventsAttended() { return totalEventsAttended; }
    public void setTotalEventsAttended(Integer totalEventsAttended) { this.totalEventsAttended = totalEventsAttended; }
    public Double getAttendancePercentage() { return attendancePercentage; }
    public void setAttendancePercentage(Double attendancePercentage) { this.attendancePercentage = attendancePercentage; }
    public Double getTotalVolunteerHours() { return totalVolunteerHours; }
    public void setTotalVolunteerHours(Double totalVolunteerHours) { this.totalVolunteerHours = totalVolunteerHours; }
    public Integer getTotalAchievements() { return totalAchievements; }
    public void setTotalAchievements(Integer totalAchievements) { this.totalAchievements = totalAchievements; }
    public Integer getTotalCertificates() { return totalCertificates; }
    public void setTotalCertificates(Integer totalCertificates) { this.totalCertificates = totalCertificates; }
    public List<MembershipDTO> getMemberships() { return memberships; }
    public void setMemberships(List<MembershipDTO> memberships) { this.memberships = memberships; }
    public List<ActivityDTO> getActivities() { return activities; }
    public void setActivities(List<ActivityDTO> activities) { this.activities = activities; }
    public List<AchievementDTO> getAchievements() { return achievements; }
    public void setAchievements(List<AchievementDTO> achievements) { this.achievements = achievements; }
    public List<CertificateDTO> getCertificates() { return certificates; }
    public void setCertificates(List<CertificateDTO> certificates) { this.certificates = certificates; }

    public static StudentDTOBuilder builder() { return new StudentDTOBuilder(); }

    public String getLeetcode() { return leetcode; }
    public void setLeetcode(String leetcode) { this.leetcode = leetcode; }
    public String getGithub() { return github; }
    public void setGithub(String github) { this.github = github; }
    public String getHackerrank() { return hackerrank; }
    public void setHackerrank(String hackerrank) { this.hackerrank = hackerrank; }
    public String getLinkedin() { return linkedin; }
    public void setLinkedin(String linkedin) { this.linkedin = linkedin; }
    public String getCodechef() { return codechef; }
    public void setCodechef(String codechef) { this.codechef = codechef; }
    public String getCustomLinks() { return customLinks; }
    public void setCustomLinks(String customLinks) { this.customLinks = customLinks; }

    public static class StudentDTOBuilder {
        private Long id;
        private Long userId;
        private String studentCode;
        private String name;
        private String email;
        private String department;
        private String degree;
        private Integer year;
        private Integer semester;
        private String contact;
        private String profileImage;
        private Integer totalCommunitiesJoined;
        private Integer totalEventsRegistered;
        private Integer totalEventsAttended;
        private Double attendancePercentage;
        private Double totalVolunteerHours;
        private Integer totalAchievements;
        private Integer totalCertificates;
        private String leetcode;
        private String github;
        private String hackerrank;
        private String linkedin;
        private String codechef;
        private String customLinks;
        private List<MembershipDTO> memberships;
        private List<ActivityDTO> activities;
        private List<AchievementDTO> achievements;
        private List<CertificateDTO> certificates;

        public StudentDTOBuilder id(Long id) { this.id = id; return this; }
        public StudentDTOBuilder userId(Long userId) { this.userId = userId; return this; }
        public StudentDTOBuilder studentCode(String studentCode) { this.studentCode = studentCode; return this; }
        public StudentDTOBuilder name(String name) { this.name = name; return this; }
        public StudentDTOBuilder email(String email) { this.email = email; return this; }
        public StudentDTOBuilder department(String department) { this.department = department; return this; }
        public StudentDTOBuilder degree(String degree) { this.degree = degree; return this; }
        public StudentDTOBuilder year(Integer year) { this.year = year; return this; }
        public StudentDTOBuilder semester(Integer semester) { this.semester = semester; return this; }
        public StudentDTOBuilder contact(String contact) { this.contact = contact; return this; }
        public StudentDTOBuilder profileImage(String profileImage) { this.profileImage = profileImage; return this; }
        public StudentDTOBuilder totalCommunitiesJoined(Integer totalCommunitiesJoined) { this.totalCommunitiesJoined = totalCommunitiesJoined; return this; }
        public StudentDTOBuilder totalEventsRegistered(Integer totalEventsRegistered) { this.totalEventsRegistered = totalEventsRegistered; return this; }
        public StudentDTOBuilder totalEventsAttended(Integer totalEventsAttended) { this.totalEventsAttended = totalEventsAttended; return this; }
        public StudentDTOBuilder attendancePercentage(Double attendancePercentage) { this.attendancePercentage = attendancePercentage; return this; }
        public StudentDTOBuilder totalVolunteerHours(Double totalVolunteerHours) { this.totalVolunteerHours = totalVolunteerHours; return this; }
        public StudentDTOBuilder totalAchievements(Integer totalAchievements) { this.totalAchievements = totalAchievements; return this; }
        public StudentDTOBuilder totalCertificates(Integer totalCertificates) { this.totalCertificates = totalCertificates; return this; }
        public StudentDTOBuilder leetcode(String leetcode) { this.leetcode = leetcode; return this; }
        public StudentDTOBuilder github(String github) { this.github = github; return this; }
        public StudentDTOBuilder hackerrank(String hackerrank) { this.hackerrank = hackerrank; return this; }
        public StudentDTOBuilder linkedin(String linkedin) { this.linkedin = linkedin; return this; }
        public StudentDTOBuilder codechef(String codechef) { this.codechef = codechef; return this; }
        public StudentDTOBuilder customLinks(String customLinks) { this.customLinks = customLinks; return this; }
        public StudentDTOBuilder memberships(List<MembershipDTO> memberships) { this.memberships = memberships; return this; }
        public StudentDTOBuilder activities(List<ActivityDTO> activities) { this.activities = activities; return this; }
        public StudentDTOBuilder achievements(List<AchievementDTO> achievements) { this.achievements = achievements; return this; }
        public StudentDTOBuilder certificates(List<CertificateDTO> certificates) { this.certificates = certificates; return this; }

        public StudentDTO build() {
            StudentDTO dto = new StudentDTO(id, userId, studentCode, name, email, department, degree, year, semester, contact, profileImage, totalCommunitiesJoined, totalEventsRegistered, totalEventsAttended, attendancePercentage, totalVolunteerHours, totalAchievements, totalCertificates, memberships, activities, achievements, certificates);
            dto.setLeetcode(leetcode);
            dto.setGithub(github);
            dto.setHackerrank(hackerrank);
            dto.setLinkedin(linkedin);
            dto.setCodechef(codechef);
            dto.setCustomLinks(customLinks);
            return dto;
        }
    }
}
