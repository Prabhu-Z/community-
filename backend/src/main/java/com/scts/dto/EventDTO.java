package com.scts.dto;

import com.scts.entity.EventStatus;
import com.scts.entity.EventType;
import java.time.LocalDate;

public class EventDTO {
    private Long id;
    private Long communityId;
    private String communityName;
    private String title;
    private String description;
    private EventType eventType;
    private String eventScope; // "COMMUNITY_EVENT" (Private to Community Members) vs "GLOBAL_EVENT" (Open to All Campus Students)
    private String venue;
    private LocalDate eventDate;
    private String time;
    private String duration;
    private LocalDate registrationDeadline;
    private Integer maxParticipants;
    private Long currentRegistrations;
    private EventStatus status;
    private String coordinatorName;
    private String proposedByName;
    private Boolean isUserRegistered;
    private String userRegistrationStatus; // "REGISTERED", "NOMINATED" or null
    private String otpCode;

    public EventDTO() {}

    public EventDTO(Long id, Long communityId, String communityName, String title, String description, EventType eventType, String eventScope, String venue, LocalDate eventDate, String time, String duration, LocalDate registrationDeadline, Integer maxParticipants, Long currentRegistrations, EventStatus status, String coordinatorName, String proposedByName, Boolean isUserRegistered, String userRegistrationStatus, String otpCode) {
        this.id = id;
        this.communityId = communityId;
        this.communityName = communityName;
        this.title = title;
        this.description = description;
        this.eventType = eventType;
        this.eventScope = eventScope;
        this.venue = venue;
        this.eventDate = eventDate;
        this.time = time;
        this.duration = duration;
        this.registrationDeadline = registrationDeadline;
        this.maxParticipants = maxParticipants;
        this.currentRegistrations = currentRegistrations;
        this.status = status;
        this.coordinatorName = coordinatorName;
        this.proposedByName = proposedByName;
        this.isUserRegistered = isUserRegistered;
        this.userRegistrationStatus = userRegistrationStatus;
        this.otpCode = otpCode;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getCommunityId() { return communityId; }
    public void setCommunityId(Long communityId) { this.communityId = communityId; }
    public String getCommunityName() { return communityName; }
    public void setCommunityName(String communityName) { this.communityName = communityName; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public EventType getEventType() { return eventType; }
    public void setEventType(EventType eventType) { this.eventType = eventType; }
    public String getEventScope() { return eventScope; }
    public void setEventScope(String eventScope) { this.eventScope = eventScope; }
    public String getVenue() { return venue; }
    public void setVenue(String venue) { this.venue = venue; }
    public LocalDate getEventDate() { return eventDate; }
    public void setEventDate(LocalDate eventDate) { this.eventDate = eventDate; }
    public String getTime() { return time; }
    public void setTime(String time) { this.time = time; }
    public String getDuration() { return duration; }
    public void setDuration(String duration) { this.duration = duration; }
    public LocalDate getRegistrationDeadline() { return registrationDeadline; }
    public void setRegistrationDeadline(LocalDate registrationDeadline) { this.registrationDeadline = registrationDeadline; }
    public Integer getMaxParticipants() { return maxParticipants; }
    public void setMaxParticipants(Integer maxParticipants) { this.maxParticipants = maxParticipants; }
    public Long getCurrentRegistrations() { return currentRegistrations; }
    public void setCurrentRegistrations(Long currentRegistrations) { this.currentRegistrations = currentRegistrations; }
    public EventStatus getStatus() { return status; }
    public void setStatus(EventStatus status) { this.status = status; }
    public String getCoordinatorName() { return coordinatorName; }
    public void setCoordinatorName(String coordinatorName) { this.coordinatorName = coordinatorName; }
    public String getProposedByName() { return proposedByName; }
    public void setProposedByName(String proposedByName) { this.proposedByName = proposedByName; }
    public Boolean getIsUserRegistered() { return isUserRegistered; }
    public void setIsUserRegistered(Boolean isUserRegistered) { this.isUserRegistered = isUserRegistered; }
    public String getUserRegistrationStatus() { return userRegistrationStatus; }
    public void setUserRegistrationStatus(String userRegistrationStatus) { this.userRegistrationStatus = userRegistrationStatus; }
    public String getOtpCode() { return otpCode; }
    public void setOtpCode(String otpCode) { this.otpCode = otpCode; }

    public static EventDTOBuilder builder() { return new EventDTOBuilder(); }

    public static class EventDTOBuilder {
        private Long id;
        private Long communityId;
        private String communityName;
        private String title;
        private String description;
        private EventType eventType;
        private String eventScope;
        private String venue;
        private LocalDate eventDate;
        private String time;
        private String duration;
        private LocalDate registrationDeadline;
        private Integer maxParticipants;
        private Long currentRegistrations;
        private EventStatus status;
        private String coordinatorName;
        private String proposedByName;
        private Boolean isUserRegistered;
        private String userRegistrationStatus;
        private String otpCode;

        public EventDTOBuilder id(Long id) { this.id = id; return this; }
        public EventDTOBuilder communityId(Long communityId) { this.communityId = communityId; return this; }
        public EventDTOBuilder communityName(String communityName) { this.communityName = communityName; return this; }
        public EventDTOBuilder title(String title) { this.title = title; return this; }
        public EventDTOBuilder description(String description) { this.description = description; return this; }
        public EventDTOBuilder eventType(EventType eventType) { this.eventType = eventType; return this; }
        public EventDTOBuilder eventScope(String eventScope) { this.eventScope = eventScope; return this; }
        public EventDTOBuilder venue(String venue) { this.venue = venue; return this; }
        public EventDTOBuilder eventDate(LocalDate eventDate) { this.eventDate = eventDate; return this; }
        public EventDTOBuilder time(String time) { this.time = time; return this; }
        public EventDTOBuilder duration(String duration) { this.duration = duration; return this; }
        public EventDTOBuilder registrationDeadline(LocalDate registrationDeadline) { this.registrationDeadline = registrationDeadline; return this; }
        public EventDTOBuilder maxParticipants(Integer maxParticipants) { this.maxParticipants = maxParticipants; return this; }
        public EventDTOBuilder currentRegistrations(Long currentRegistrations) { this.currentRegistrations = currentRegistrations; return this; }
        public EventDTOBuilder status(EventStatus status) { this.status = status; return this; }
        public EventDTOBuilder coordinatorName(String coordinatorName) { this.coordinatorName = coordinatorName; return this; }
        public EventDTOBuilder proposedByName(String proposedByName) { this.proposedByName = proposedByName; return this; }
        public EventDTOBuilder isUserRegistered(Boolean isUserRegistered) { this.isUserRegistered = isUserRegistered; return this; }
        public EventDTOBuilder userRegistrationStatus(String userRegistrationStatus) { this.userRegistrationStatus = userRegistrationStatus; return this; }
        public EventDTOBuilder otpCode(String otpCode) { this.otpCode = otpCode; return this; }

        public EventDTO build() {
            return new EventDTO(id, communityId, communityName, title, description, eventType, eventScope, venue, eventDate, time, duration, registrationDeadline, maxParticipants, currentRegistrations, status, coordinatorName, proposedByName, isUserRegistered, userRegistrationStatus, otpCode);
        }
    }
}
