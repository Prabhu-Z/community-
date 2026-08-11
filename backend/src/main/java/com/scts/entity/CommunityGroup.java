package com.scts.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "community_groups")
public class CommunityGroup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "group_name", nullable = false)
    private String groupName;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "max_team_size", nullable = false)
    private Integer maxTeamSize = 5;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "community_id", nullable = false)
    private Community community;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "leader_student_id", nullable = true)
    private Student leaderStudent;

    @Column(nullable = false)
    private String status = "PENDING"; // "PENDING", "OPEN", "FULL", "DECLINED"

    @Column(name = "approval_status", nullable = false)
    private String approvalStatus = "PENDING"; // "PENDING", "APPROVED", "DECLINED"

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public CommunityGroup() {}

    public CommunityGroup(Long id, String groupName, String description, Integer maxTeamSize, Community community, Student leaderStudent, String status, String approvalStatus, LocalDateTime createdAt) {
        this.id = id;
        this.groupName = groupName;
        this.description = description;
        this.maxTeamSize = maxTeamSize;
        this.community = community;
        this.leaderStudent = leaderStudent;
        this.status = status;
        this.approvalStatus = approvalStatus;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getGroupName() {
        return groupName;
    }

    public void setGroupName(String groupName) {
        this.groupName = groupName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getMaxTeamSize() {
        return maxTeamSize;
    }

    public void setMaxTeamSize(Integer maxTeamSize) {
        this.maxTeamSize = maxTeamSize;
    }

    public Community getCommunity() {
        return community;
    }

    public void setCommunity(Community community) {
        this.community = community;
    }

    public Student getLeaderStudent() {
        return leaderStudent;
    }

    public void setLeaderStudent(Student leaderStudent) {
        this.leaderStudent = leaderStudent;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getApprovalStatus() {
        return approvalStatus;
    }

    public void setApprovalStatus(String approvalStatus) {
        this.approvalStatus = approvalStatus;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
