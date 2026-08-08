package com.scts.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "students")
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", referencedColumnName = "id", nullable = false)
    private User user;

    @Column(name = "student_code", nullable = false, unique = true)
    private String studentCode;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String department;

    @Column(nullable = false)
    private String degree;

    @Column(name = "academic_year", nullable = false)
    private Integer year;

    @Column(nullable = false)
    private Integer semester;

    private String contact;

    @Column(name = "profile_image")
    private String profileImage;

    @Column(name = "points")
    private Integer points = 0;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public Student() {}

    public Student(Long id, User user, String studentCode, String name, String department, String degree, Integer year, Integer semester, String contact, String profileImage, LocalDateTime createdAt) {
        this.id = id;
        this.user = user;
        this.studentCode = studentCode;
        this.name = name;
        this.department = department;
        this.degree = degree;
        this.year = year;
        this.semester = semester;
        this.contact = contact;
        this.profileImage = profileImage;
        this.createdAt = createdAt;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getStudentCode() { return studentCode; }
    public void setStudentCode(String studentCode) { this.studentCode = studentCode; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
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
    public Integer getPoints() { return points != null ? points : 0; }
    public void setPoints(Integer points) { this.points = points; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static StudentBuilder builder() { return new StudentBuilder(); }

    public static class StudentBuilder {
        private Long id;
        private User user;
        private String studentCode;
        private String name;
        private String department;
        private String degree;
        private Integer year;
        private Integer semester;
        private String contact;
        private String profileImage;
        private LocalDateTime createdAt;

        public StudentBuilder id(Long id) { this.id = id; return this; }
        public StudentBuilder user(User user) { this.user = user; return this; }
        public StudentBuilder studentCode(String studentCode) { this.studentCode = studentCode; return this; }
        public StudentBuilder name(String name) { this.name = name; return this; }
        public StudentBuilder department(String department) { this.department = department; return this; }
        public StudentBuilder degree(String degree) { this.degree = degree; return this; }
        public StudentBuilder year(Integer year) { this.year = year; return this; }
        public StudentBuilder semester(Integer semester) { this.semester = semester; return this; }
        public StudentBuilder contact(String contact) { this.contact = contact; return this; }
        public StudentBuilder profileImage(String profileImage) { this.profileImage = profileImage; return this; }
        public StudentBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public Student build() {
            return new Student(id, user, studentCode, name, department, degree, year, semester, contact, profileImage, createdAt);
        }
    }
}
