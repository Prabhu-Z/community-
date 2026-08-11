package com.scts.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "collaboration_requests")
public class CollaborationRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requesting_community_id", nullable = false)
    private Community requestingCommunity;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "target_community_id", nullable = false)
    private Community targetCommunity;

    @Column(nullable = false)
    private String status; // "PENDING", "APPROVED", "REJECTED"

    @Column(columnDefinition = "TEXT")
    private String message; // Description/message for the collaboration request

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "collaboration_request_nominations",
        joinColumns = @JoinColumn(name = "request_id"),
        inverseJoinColumns = @JoinColumn(name = "student_id")
    )
    private List<Student> nominatedStudents = new ArrayList<>();

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    public CollaborationRequest() {}

    public CollaborationRequest(Long id, Event event, Community requestingCommunity, Community targetCommunity, String status, String message, List<Student> nominatedStudents, LocalDateTime createdAt) {
        this.id = id;
        this.event = event;
        this.requestingCommunity = requestingCommunity;
        this.targetCommunity = targetCommunity;
        this.status = status;
        this.message = message;
        this.nominatedStudents = nominatedStudents;
        this.createdAt = createdAt;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = "PENDING";
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Event getEvent() { return event; }
    public void setEvent(Event event) { this.event = event; }

    public Community getRequestingCommunity() { return requestingCommunity; }
    public void setRequestingCommunity(Community requestingCommunity) { this.requestingCommunity = requestingCommunity; }

    public Community getTargetCommunity() { return targetCommunity; }
    public void setTargetCommunity(Community targetCommunity) { this.targetCommunity = targetCommunity; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public List<Student> getNominatedStudents() { return nominatedStudents; }
    public void setNominatedStudents(List<Student> nominatedStudents) { this.nominatedStudents = nominatedStudents; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static CollaborationRequestBuilder builder() { return new CollaborationRequestBuilder(); }

    public static class CollaborationRequestBuilder {
        private Long id;
        private Event event;
        private Community requestingCommunity;
        private Community targetCommunity;
        private String status;
        private String message;
        private List<Student> nominatedStudents = new ArrayList<>();
        private LocalDateTime createdAt;

        public CollaborationRequestBuilder id(Long id) { this.id = id; return this; }
        public CollaborationRequestBuilder event(Event event) { this.event = event; return this; }
        public CollaborationRequestBuilder requestingCommunity(Community requestingCommunity) { this.requestingCommunity = requestingCommunity; return this; }
        public CollaborationRequestBuilder targetCommunity(Community targetCommunity) { this.targetCommunity = targetCommunity; return this; }
        public CollaborationRequestBuilder status(String status) { this.status = status; return this; }
        public CollaborationRequestBuilder message(String message) { this.message = message; return this; }
        public CollaborationRequestBuilder nominatedStudents(List<Student> nominatedStudents) { this.nominatedStudents = nominatedStudents; return this; }
        public CollaborationRequestBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public CollaborationRequest build() {
            return new CollaborationRequest(id, event, requestingCommunity, targetCommunity, status, message, nominatedStudents, createdAt);
        }
    }
}
