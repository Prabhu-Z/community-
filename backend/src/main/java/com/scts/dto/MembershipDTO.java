package com.scts.dto;

import com.scts.entity.CommunityRole;
import com.scts.entity.MembershipStatus;
import java.time.LocalDate;

public class MembershipDTO {
    private Long id;
    private Long studentId;
    private String studentName;
    private String studentCode;
    private String department;
    private Long communityId;
    private String communityName;
    private String communityCategory;
    private CommunityRole role;
    private MembershipStatus status;
    private LocalDate joinedDate;
    private Boolean coordinatorApproved;
    private Boolean adminApproved;

    public MembershipDTO() {}

    public MembershipDTO(Long id, Long studentId, String studentName, String studentCode, String department, Long communityId, String communityName, String communityCategory, CommunityRole role, MembershipStatus status, LocalDate joinedDate, Boolean coordinatorApproved, Boolean adminApproved) {
        this.id = id;
        this.studentId = studentId;
        this.studentName = studentName;
        this.studentCode = studentCode;
        this.department = department;
        this.communityId = communityId;
        this.communityName = communityName;
        this.communityCategory = communityCategory;
        this.role = role;
        this.status = status;
        this.joinedDate = joinedDate;
        this.coordinatorApproved = coordinatorApproved != null ? coordinatorApproved : false;
        this.adminApproved = adminApproved != null ? adminApproved : false;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }
    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }
    public String getStudentCode() { return studentCode; }
    public void setStudentCode(String studentCode) { this.studentCode = studentCode; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public Long getCommunityId() { return communityId; }
    public void setCommunityId(Long communityId) { this.communityId = communityId; }
    public String getCommunityName() { return communityName; }
    public void setCommunityName(String communityName) { this.communityName = communityName; }
    public String getCommunityCategory() { return communityCategory; }
    public void setCommunityCategory(String communityCategory) { this.communityCategory = communityCategory; }
    public CommunityRole getRole() { return role; }
    public void setRole(CommunityRole role) { this.role = role; }
    public MembershipStatus getStatus() { return status; }
    public void setStatus(MembershipStatus status) { this.status = status; }
    public LocalDate getJoinedDate() { return joinedDate; }
    public void setJoinedDate(LocalDate joinedDate) { this.joinedDate = joinedDate; }
    public Boolean getCoordinatorApproved() { return coordinatorApproved; }
    public void setCoordinatorApproved(Boolean coordinatorApproved) { this.coordinatorApproved = coordinatorApproved; }
    public Boolean getAdminApproved() { return adminApproved; }
    public void setAdminApproved(Boolean adminApproved) { this.adminApproved = adminApproved; }

    public static MembershipDTOBuilder builder() { return new MembershipDTOBuilder(); }

    public static class MembershipDTOBuilder {
        private Long id;
        private Long studentId;
        private String studentName;
        private String studentCode;
        private String department;
        private Long communityId;
        private String communityName;
        private String communityCategory;
        private CommunityRole role;
        private MembershipStatus status;
        private LocalDate joinedDate;
        private Boolean coordinatorApproved;
        private Boolean adminApproved;

        public MembershipDTOBuilder id(Long id) { this.id = id; return this; }
        public MembershipDTOBuilder studentId(Long studentId) { this.studentId = studentId; return this; }
        public MembershipDTOBuilder studentName(String studentName) { this.studentName = studentName; return this; }
        public MembershipDTOBuilder studentCode(String studentCode) { this.studentCode = studentCode; return this; }
        public MembershipDTOBuilder department(String department) { this.department = department; return this; }
        public MembershipDTOBuilder communityId(Long communityId) { this.communityId = communityId; return this; }
        public MembershipDTOBuilder communityName(String communityName) { this.communityName = communityName; return this; }
        public MembershipDTOBuilder communityCategory(String communityCategory) { this.communityCategory = communityCategory; return this; }
        public MembershipDTOBuilder role(CommunityRole role) { this.role = role; return this; }
        public MembershipDTOBuilder status(MembershipStatus status) { this.status = status; return this; }
        public MembershipDTOBuilder joinedDate(LocalDate joinedDate) { this.joinedDate = joinedDate; return this; }
        public MembershipDTOBuilder coordinatorApproved(Boolean coordinatorApproved) { this.coordinatorApproved = coordinatorApproved; return this; }
        public MembershipDTOBuilder adminApproved(Boolean adminApproved) { this.adminApproved = adminApproved; return this; }

        public MembershipDTO build() {
            return new MembershipDTO(id, studentId, studentName, studentCode, department, communityId, communityName, communityCategory, role, status, joinedDate, coordinatorApproved, adminApproved);
        }
    }
}
