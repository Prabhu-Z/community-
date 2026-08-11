package com.scts.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "community_resources")
public class CommunityResource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(length = 2000)
    private String description;

    @Column(length = 500)
    private String link;

    @Column(name = "document_names", length = 2000)
    private String documentNames; // Comma-separated original file names

    @Column(name = "document_paths", length = 2000)
    private String documentPaths; // Comma-separated stored file paths

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "community_id", nullable = false)
    private Community community;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public CommunityResource() {}

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getLink() { return link; }
    public void setLink(String link) { this.link = link; }
    public String getDocumentNames() { return documentNames; }
    public void setDocumentNames(String documentNames) { this.documentNames = documentNames; }
    public String getDocumentPaths() { return documentPaths; }
    public void setDocumentPaths(String documentPaths) { this.documentPaths = documentPaths; }
    public Community getCommunity() { return community; }
    public void setCommunity(Community community) { this.community = community; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
