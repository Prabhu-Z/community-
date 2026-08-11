package com.scts.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "memberships", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"student_id", "community_id"})
})
public class Membership {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "community_id", nullable = false)
    private Community community;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CommunityRole role;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MembershipStatus status;

    @Column(name = "joined_date")
    private LocalDate joinedDate;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "coordinator_approved", nullable = false)
    private Boolean coordinatorApproved = false;

    @Column(name = "admin_approved", nullable = false)
    private Boolean adminApproved = false;

    public Membership() {}

    public Membership(Long id, Student student, Community community, CommunityRole role, MembershipStatus status, LocalDate joinedDate, LocalDateTime updatedAt, Boolean coordinatorApproved, Boolean adminApproved) {
        this.id = id;
        this.student = student;
        this.community = community;
        this.role = role;
        this.status = status;
        this.joinedDate = joinedDate;
        this.updatedAt = updatedAt;
        this.coordinatorApproved = coordinatorApproved != null ? coordinatorApproved : false;
        this.adminApproved = adminApproved != null ? adminApproved : false;
    }

    @PrePersist
    @PreUpdate
    protected void onSave() {
        this.updatedAt = LocalDateTime.now();
        if (this.status == MembershipStatus.APPROVED) {
            this.coordinatorApproved = true;
            this.adminApproved = true;
        }
        if (this.coordinatorApproved && this.adminApproved) {
            this.status = MembershipStatus.APPROVED;
            if (this.joinedDate == null) {
                this.joinedDate = LocalDate.now();
            }
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Student getStudent() { return student; }
    public void setStudent(Student student) { this.student = student; }
    public Community getCommunity() { return community; }
    public void setCommunity(Community community) { this.community = community; }
    public CommunityRole getRole() { return role; }
    public void setRole(CommunityRole role) { this.role = role; }
    public MembershipStatus getStatus() { return status; }
    public void setStatus(MembershipStatus status) { this.status = status; }
    public LocalDate getJoinedDate() { return joinedDate; }
    public void setJoinedDate(LocalDate joinedDate) { this.joinedDate = joinedDate; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public Boolean getCoordinatorApproved() { return coordinatorApproved; }
    public void setCoordinatorApproved(Boolean coordinatorApproved) { this.coordinatorApproved = coordinatorApproved; }
    public Boolean getAdminApproved() { return adminApproved; }
    public void setAdminApproved(Boolean adminApproved) { this.adminApproved = adminApproved; }

    public static MembershipBuilder builder() { return new MembershipBuilder(); }

    public static class MembershipBuilder {
        private Long id;
        private Student student;
        private Community community;
        private CommunityRole role;
        private MembershipStatus status;
        private LocalDate joinedDate;
        private LocalDateTime updatedAt;
        private Boolean coordinatorApproved;
        private Boolean adminApproved;

        public MembershipBuilder id(Long id) { this.id = id; return this; }
        public MembershipBuilder student(Student student) { this.student = student; return this; }
        public MembershipBuilder community(Community community) { this.community = community; return this; }
        public MembershipBuilder role(CommunityRole role) { this.role = role; return this; }
        public MembershipBuilder status(MembershipStatus status) { this.status = status; return this; }
        public MembershipBuilder joinedDate(LocalDate joinedDate) { this.joinedDate = joinedDate; return this; }
        public MembershipBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }
        public MembershipBuilder coordinatorApproved(Boolean coordinatorApproved) { this.coordinatorApproved = coordinatorApproved; return this; }
        public MembershipBuilder adminApproved(Boolean adminApproved) { this.adminApproved = adminApproved; return this; }

        public Membership build() {
            return new Membership(id, student, community, role, status, joinedDate, updatedAt, coordinatorApproved, adminApproved);
        }
    }
}
