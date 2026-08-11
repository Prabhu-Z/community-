package com.scts.dto;

import java.util.List;
import java.util.Map;

public class CommunityAnalyticsDTO {
    private Long communityId;
    private String communityName;
    private String category;
    private String studentCoordinator;
    private String facultyCoordinator;
    private long totalMembers;
    private long totalEvents;
    private long totalEventRegistrations;
    private long totalTasksAssigned;
    private long totalSubmissions;
    private long verifiedSubmissions;
    private long pendingSubmissions;
    private long rejectedSubmissions;
    private double participationPercentage;
    private List<Map<String, Object>> taskStatusChartData;
    private List<Map<String, Object>> participationRateChartData;
    private List<Map<String, Object>> taskTypeChartData;
    private List<Map<String, Object>> eventAttendanceChartData;
    private List<Map<String, Object>> departmentPointsChartData;

    public CommunityAnalyticsDTO() {}

    public CommunityAnalyticsDTO(Long communityId, String communityName, String category, String studentCoordinator, String facultyCoordinator, long totalMembers, long totalEvents, long totalEventRegistrations, long totalTasksAssigned, long totalSubmissions, long verifiedSubmissions, long pendingSubmissions, long rejectedSubmissions, double participationPercentage, List<Map<String, Object>> taskStatusChartData, List<Map<String, Object>> participationRateChartData, List<Map<String, Object>> taskTypeChartData, List<Map<String, Object>> eventAttendanceChartData, List<Map<String, Object>> departmentPointsChartData) {
        this.communityId = communityId;
        this.communityName = communityName;
        this.category = category;
        this.studentCoordinator = studentCoordinator;
        this.facultyCoordinator = facultyCoordinator;
        this.totalMembers = totalMembers;
        this.totalEvents = totalEvents;
        this.totalEventRegistrations = totalEventRegistrations;
        this.totalTasksAssigned = totalTasksAssigned;
        this.totalSubmissions = totalSubmissions;
        this.verifiedSubmissions = verifiedSubmissions;
        this.pendingSubmissions = pendingSubmissions;
        this.rejectedSubmissions = rejectedSubmissions;
        this.participationPercentage = participationPercentage;
        this.taskStatusChartData = taskStatusChartData;
        this.participationRateChartData = participationRateChartData;
        this.taskTypeChartData = taskTypeChartData;
        this.eventAttendanceChartData = eventAttendanceChartData;
        this.departmentPointsChartData = departmentPointsChartData;
    }

    public Long getCommunityId() { return communityId; }
    public void setCommunityId(Long communityId) { this.communityId = communityId; }

    public String getCommunityName() { return communityName; }
    public void setCommunityName(String communityName) { this.communityName = communityName; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getStudentCoordinator() { return studentCoordinator; }
    public void setStudentCoordinator(String studentCoordinator) { this.studentCoordinator = studentCoordinator; }

    public String getFacultyCoordinator() { return facultyCoordinator; }
    public void setFacultyCoordinator(String facultyCoordinator) { this.facultyCoordinator = facultyCoordinator; }

    public long getTotalMembers() { return totalMembers; }
    public void setTotalMembers(long totalMembers) { this.totalMembers = totalMembers; }

    public long getTotalEvents() { return totalEvents; }
    public void setTotalEvents(long totalEvents) { this.totalEvents = totalEvents; }

    public long getTotalEventRegistrations() { return totalEventRegistrations; }
    public void setTotalEventRegistrations(long totalEventRegistrations) { this.totalEventRegistrations = totalEventRegistrations; }

    public long getTotalTasksAssigned() { return totalTasksAssigned; }
    public void setTotalTasksAssigned(long totalTasksAssigned) { this.totalTasksAssigned = totalTasksAssigned; }

    public long getTotalSubmissions() { return totalSubmissions; }
    public void setTotalSubmissions(long totalSubmissions) { this.totalSubmissions = totalSubmissions; }

    public long getVerifiedSubmissions() { return verifiedSubmissions; }
    public void setVerifiedSubmissions(long verifiedSubmissions) { this.verifiedSubmissions = verifiedSubmissions; }

    public long getPendingSubmissions() { return pendingSubmissions; }
    public void setPendingSubmissions(long pendingSubmissions) { this.pendingSubmissions = pendingSubmissions; }

    public long getRejectedSubmissions() { return rejectedSubmissions; }
    public void setRejectedSubmissions(long rejectedSubmissions) { this.rejectedSubmissions = rejectedSubmissions; }

    public double getParticipationPercentage() { return participationPercentage; }
    public void setParticipationPercentage(double participationPercentage) { this.participationPercentage = participationPercentage; }

    public List<Map<String, Object>> getTaskStatusChartData() { return taskStatusChartData; }
    public void setTaskStatusChartData(List<Map<String, Object>> taskStatusChartData) { this.taskStatusChartData = taskStatusChartData; }

    public List<Map<String, Object>> getParticipationRateChartData() { return participationRateChartData; }
    public void setParticipationRateChartData(List<Map<String, Object>> participationRateChartData) { this.participationRateChartData = participationRateChartData; }

    public List<Map<String, Object>> getTaskTypeChartData() { return taskTypeChartData; }
    public void setTaskTypeChartData(List<Map<String, Object>> taskTypeChartData) { this.taskTypeChartData = taskTypeChartData; }

    public List<Map<String, Object>> getEventAttendanceChartData() { return eventAttendanceChartData; }
    public void setEventAttendanceChartData(List<Map<String, Object>> eventAttendanceChartData) { this.eventAttendanceChartData = eventAttendanceChartData; }

    public List<Map<String, Object>> getDepartmentPointsChartData() { return departmentPointsChartData; }
    public void setDepartmentPointsChartData(List<Map<String, Object>> departmentPointsChartData) { this.departmentPointsChartData = departmentPointsChartData; }

    public static CommunityAnalyticsDTOBuilder builder() { return new CommunityAnalyticsDTOBuilder(); }

    public static class CommunityAnalyticsDTOBuilder {
        private Long communityId;
        private String communityName;
        private String category;
        private String studentCoordinator;
        private String facultyCoordinator;
        private long totalMembers;
        private long totalEvents;
        private long totalEventRegistrations;
        private long totalTasksAssigned;
        private long totalSubmissions;
        private long verifiedSubmissions;
        private long pendingSubmissions;
        private long rejectedSubmissions;
        private double participationPercentage;
        private List<Map<String, Object>> taskStatusChartData;
        private List<Map<String, Object>> participationRateChartData;
        private List<Map<String, Object>> taskTypeChartData;
        private List<Map<String, Object>> eventAttendanceChartData;
        private List<Map<String, Object>> departmentPointsChartData;

        public CommunityAnalyticsDTOBuilder communityId(Long communityId) { this.communityId = communityId; return this; }
        public CommunityAnalyticsDTOBuilder communityName(String communityName) { this.communityName = communityName; return this; }
        public CommunityAnalyticsDTOBuilder category(String category) { this.category = category; return this; }
        public CommunityAnalyticsDTOBuilder studentCoordinator(String studentCoordinator) { this.studentCoordinator = studentCoordinator; return this; }
        public CommunityAnalyticsDTOBuilder facultyCoordinator(String facultyCoordinator) { this.facultyCoordinator = facultyCoordinator; return this; }
        public CommunityAnalyticsDTOBuilder totalMembers(long totalMembers) { this.totalMembers = totalMembers; return this; }
        public CommunityAnalyticsDTOBuilder totalEvents(long totalEvents) { this.totalEvents = totalEvents; return this; }
        public CommunityAnalyticsDTOBuilder totalEventRegistrations(long totalEventRegistrations) { this.totalEventRegistrations = totalEventRegistrations; return this; }
        public CommunityAnalyticsDTOBuilder totalTasksAssigned(long totalTasksAssigned) { this.totalTasksAssigned = totalTasksAssigned; return this; }
        public CommunityAnalyticsDTOBuilder totalSubmissions(long totalSubmissions) { this.totalSubmissions = totalSubmissions; return this; }
        public CommunityAnalyticsDTOBuilder verifiedSubmissions(long verifiedSubmissions) { this.verifiedSubmissions = verifiedSubmissions; return this; }
        public CommunityAnalyticsDTOBuilder pendingSubmissions(long pendingSubmissions) { this.pendingSubmissions = pendingSubmissions; return this; }
        public CommunityAnalyticsDTOBuilder rejectedSubmissions(long rejectedSubmissions) { this.rejectedSubmissions = rejectedSubmissions; return this; }
        public CommunityAnalyticsDTOBuilder participationPercentage(double participationPercentage) { this.participationPercentage = participationPercentage; return this; }
        public CommunityAnalyticsDTOBuilder taskStatusChartData(List<Map<String, Object>> taskStatusChartData) { this.taskStatusChartData = taskStatusChartData; return this; }
        public CommunityAnalyticsDTOBuilder participationRateChartData(List<Map<String, Object>> participationRateChartData) { this.participationRateChartData = participationRateChartData; return this; }
        public CommunityAnalyticsDTOBuilder taskTypeChartData(List<Map<String, Object>> taskTypeChartData) { this.taskTypeChartData = taskTypeChartData; return this; }
        public CommunityAnalyticsDTOBuilder eventAttendanceChartData(List<Map<String, Object>> eventAttendanceChartData) { this.eventAttendanceChartData = eventAttendanceChartData; return this; }
        public CommunityAnalyticsDTOBuilder departmentPointsChartData(List<Map<String, Object>> departmentPointsChartData) { this.departmentPointsChartData = departmentPointsChartData; return this; }

        public CommunityAnalyticsDTO build() {
            return new CommunityAnalyticsDTO(communityId, communityName, category, studentCoordinator, facultyCoordinator, totalMembers, totalEvents, totalEventRegistrations, totalTasksAssigned, totalSubmissions, verifiedSubmissions, pendingSubmissions, rejectedSubmissions, participationPercentage, taskStatusChartData, participationRateChartData, taskTypeChartData, eventAttendanceChartData, departmentPointsChartData);
        }
    }
}
