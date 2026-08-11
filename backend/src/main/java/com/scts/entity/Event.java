package com.scts.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "events")
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "community_id", nullable = false)
    private Community community;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "event_type", nullable = false)
    private EventType eventType;

    @Column(name = "event_scope", nullable = false)
    private String eventScope; // "COMMUNITY_EVENT" (Private to Members) vs "GLOBAL_EVENT" (Open to All Campus)

    @Column(nullable = false)
    private String venue;

    @Column(name = "event_date", nullable = false)
    private LocalDate eventDate;

    @Column(nullable = false)
    private String time;

    @Column(nullable = false)
    private String duration;

    @Column(name = "registration_deadline", nullable = false)
    private LocalDate registrationDeadline;

    @Column(name = "max_participants", nullable = false)
    private Integer maxParticipants;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EventStatus status;

    @Column(name = "coordinator_name")
    private String coordinatorName;

    @Column(name = "otp_code")
    private String otpCode;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public Event() {}

    public Event(Long id, Community community, String title, String description, EventType eventType, String eventScope, String venue, LocalDate eventDate, String time, String duration, LocalDate registrationDeadline, Integer maxParticipants, EventStatus status, String coordinatorName, String otpCode, LocalDateTime createdAt) {
        this.id = id;
        this.community = community;
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
        this.status = status;
        this.coordinatorName = coordinatorName;
        this.otpCode = otpCode;
        this.createdAt = createdAt;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = EventStatus.UPCOMING;
        }
        if (this.eventScope == null) {
            this.eventScope = "COMMUNITY_EVENT";
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Community getCommunity() { return community; }
    public void setCommunity(Community community) { this.community = community; }

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

    public EventStatus getStatus() { return status; }
    public void setStatus(EventStatus status) { this.status = status; }

    public String getCoordinatorName() { return coordinatorName; }
    public void setCoordinatorName(String coordinatorName) { this.coordinatorName = coordinatorName; }

    public String getOtpCode() { return otpCode; }
    public void setOtpCode(String otpCode) { this.otpCode = otpCode; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static EventBuilder builder() { return new EventBuilder(); }

    public static class EventBuilder {
        private Long id;
        private Community community;
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
        private EventStatus status;
        private String coordinatorName;
        private String otpCode;
        private LocalDateTime createdAt;

        public EventBuilder id(Long id) { this.id = id; return this; }
        public EventBuilder community(Community community) { this.community = community; return this; }
        public EventBuilder title(String title) { this.title = title; return this; }
        public EventBuilder description(String description) { this.description = description; return this; }
        public EventBuilder eventType(EventType eventType) { this.eventType = eventType; return this; }
        public EventBuilder eventScope(String eventScope) { this.eventScope = eventScope; return this; }
        public EventBuilder venue(String venue) { this.venue = venue; return this; }
        public EventBuilder eventDate(LocalDate eventDate) { this.eventDate = eventDate; return this; }
        public EventBuilder time(String time) { this.time = time; return this; }
        public EventBuilder duration(String duration) { this.duration = duration; return this; }
        public EventBuilder registrationDeadline(LocalDate registrationDeadline) { this.registrationDeadline = registrationDeadline; return this; }
        public EventBuilder maxParticipants(Integer maxParticipants) { this.maxParticipants = maxParticipants; return this; }
        public EventBuilder status(EventStatus status) { this.status = status; return this; }
        public EventBuilder coordinatorName(String coordinatorName) { this.coordinatorName = coordinatorName; return this; }
        public EventBuilder otpCode(String otpCode) { this.otpCode = otpCode; return this; }
        public EventBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public Event build() {
            return new Event(id, community, title, description, eventType, eventScope, venue, eventDate, time, duration, registrationDeadline, maxParticipants, status, coordinatorName, otpCode, createdAt);
        }
    }
}
