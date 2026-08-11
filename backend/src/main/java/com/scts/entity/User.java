package com.scts.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Column(nullable = false)
    private String status;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "faculty_reg_number")
    private String facultyRegNumber;

    @Column
    private String name;

    @Column
    private String department;

    public User() {}

    public User(Long id, String email, String password, Role role, String status, LocalDateTime createdAt) {
        this.id = id;
        this.email = email;
        this.password = password;
        this.role = role;
        this.status = status;
        this.createdAt = createdAt;
    }

    public User(Long id, String email, String password, Role role, String status, LocalDateTime createdAt, String facultyRegNumber, String name, String department) {
        this.id = id;
        this.email = email;
        this.password = password;
        this.role = role;
        this.status = status;
        this.createdAt = createdAt;
        this.facultyRegNumber = facultyRegNumber;
        this.name = name;
        this.department = department;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = "ACTIVE";
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public String getFacultyRegNumber() { return facultyRegNumber; }
    public void setFacultyRegNumber(String facultyRegNumber) { this.facultyRegNumber = facultyRegNumber; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public static UserBuilder builder() { return new UserBuilder(); }

    public static class UserBuilder {
        private Long id;
        private String email;
        private String password;
        private Role role;
        private String status;
        private LocalDateTime createdAt;
        private String facultyRegNumber;
        private String name;
        private String department;

        public UserBuilder id(Long id) { this.id = id; return this; }
        public UserBuilder email(String email) { this.email = email; return this; }
        public UserBuilder password(String password) { this.password = password; return this; }
        public UserBuilder role(Role role) { this.role = role; return this; }
        public UserBuilder status(String status) { this.status = status; return this; }
        public UserBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public UserBuilder facultyRegNumber(String facultyRegNumber) { this.facultyRegNumber = facultyRegNumber; return this; }
        public UserBuilder name(String name) { this.name = name; return this; }
        public UserBuilder department(String department) { this.department = department; return this; }

        public User build() {
            return new User(id, email, password, role, status, createdAt, facultyRegNumber, name, department);
        }
    }
}
