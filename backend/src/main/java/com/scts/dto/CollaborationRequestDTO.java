package com.scts.dto;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class CollaborationRequestDTO {
    private Long id;
    private Long eventId;
    private String eventTitle;
    private String eventDate;
    private String eventTime;
    private String eventVenue;
    private String eventDescription;
    private Long requestingCommunityId;
    private String requestingCommunityName;
    private Long targetCommunityId;
    private String targetCommunityName;
    private String status;
    private String message;
    private List<String> nominatedStudentNames = new ArrayList<>();
    private LocalDateTime createdAt;

    public CollaborationRequestDTO() {}

    public CollaborationRequestDTO(Long id, Long eventId, String eventTitle, String eventDate, String eventTime, String eventVenue, String eventDescription, Long requestingCommunityId, String requestingCommunityName, Long targetCommunityId, String targetCommunityName, String status, String message, List<String> nominatedStudentNames, LocalDateTime createdAt) {
        this.id = id;
        this.eventId = eventId;
        this.eventTitle = eventTitle;
        this.eventDate = eventDate;
        this.eventTime = eventTime;
        this.eventVenue = eventVenue;
        this.eventDescription = eventDescription;
        this.requestingCommunityId = requestingCommunityId;
        this.requestingCommunityName = requestingCommunityName;
        this.targetCommunityId = targetCommunityId;
        this.targetCommunityName = targetCommunityName;
        this.status = status;
        this.message = message;
        this.nominatedStudentNames = nominatedStudentNames;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getEventId() { return eventId; }
    public void setEventId(Long eventId) { this.eventId = eventId; }
    public String getEventTitle() { return eventTitle; }
    public void setEventTitle(String eventTitle) { this.eventTitle = eventTitle; }
    public String getEventDate() { return eventDate; }
    public void setEventDate(String eventDate) { this.eventDate = eventDate; }
    public String getEventTime() { return eventTime; }
    public void setEventTime(String eventTime) { this.eventTime = eventTime; }
    public String getEventVenue() { return eventVenue; }
    public void setEventVenue(String eventVenue) { this.eventVenue = eventVenue; }
    public String getEventDescription() { return eventDescription; }
    public void setEventDescription(String eventDescription) { this.eventDescription = eventDescription; }
    public Long getRequestingCommunityId() { return requestingCommunityId; }
    public void setRequestingCommunityId(Long requestingCommunityId) { this.requestingCommunityId = requestingCommunityId; }
    public String getRequestingCommunityName() { return requestingCommunityName; }
    public void setRequestingCommunityName(String requestingCommunityName) { this.requestingCommunityName = requestingCommunityName; }
    public Long getTargetCommunityId() { return targetCommunityId; }
    public void setTargetCommunityId(Long targetCommunityId) { this.targetCommunityId = targetCommunityId; }
    public String getTargetCommunityName() { return targetCommunityName; }
    public void setTargetCommunityName(String targetCommunityName) { this.targetCommunityName = targetCommunityName; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public List<String> getNominatedStudentNames() { return nominatedStudentNames; }
    public void setNominatedStudentNames(List<String> nominatedStudentNames) { this.nominatedStudentNames = nominatedStudentNames; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
