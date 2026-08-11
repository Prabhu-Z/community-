package com.scts.dto;

import java.time.LocalDateTime;
import java.util.List;

public class CommunityResourceDTO {
    private Long id;
    private String title;
    private String description;
    private String link;
    private Long communityId;
    private String communityName;
    private List<String> documentNames;
    private List<String> documentUrls;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public CommunityResourceDTO() {}

    public CommunityResourceDTO(Long id, String title, String description, String link, Long communityId, String communityName, List<String> documentNames, List<String> documentUrls, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.link = link;
        this.communityId = communityId;
        this.communityName = communityName;
        this.documentNames = documentNames;
        this.documentUrls = documentUrls;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getLink() { return link; }
    public void setLink(String link) { this.link = link; }
    public Long getCommunityId() { return communityId; }
    public void setCommunityId(Long communityId) { this.communityId = communityId; }
    public String getCommunityName() { return communityName; }
    public void setCommunityName(String communityName) { this.communityName = communityName; }
    public List<String> getDocumentNames() { return documentNames; }
    public void setDocumentNames(List<String> documentNames) { this.documentNames = documentNames; }
    public List<String> getDocumentUrls() { return documentUrls; }
    public void setDocumentUrls(List<String> documentUrls) { this.documentUrls = documentUrls; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public static CommunityResourceDTOBuilder builder() { return new CommunityResourceDTOBuilder(); }

    public static class CommunityResourceDTOBuilder {
        private Long id;
        private String title;
        private String description;
        private String link;
        private Long communityId;
        private String communityName;
        private List<String> documentNames;
        private List<String> documentUrls;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public CommunityResourceDTOBuilder id(Long id) { this.id = id; return this; }
        public CommunityResourceDTOBuilder title(String title) { this.title = title; return this; }
        public CommunityResourceDTOBuilder description(String description) { this.description = description; return this; }
        public CommunityResourceDTOBuilder link(String link) { this.link = link; return this; }
        public CommunityResourceDTOBuilder communityId(Long communityId) { this.communityId = communityId; return this; }
        public CommunityResourceDTOBuilder communityName(String communityName) { this.communityName = communityName; return this; }
        public CommunityResourceDTOBuilder documentNames(List<String> documentNames) { this.documentNames = documentNames; return this; }
        public CommunityResourceDTOBuilder documentUrls(List<String> documentUrls) { this.documentUrls = documentUrls; return this; }
        public CommunityResourceDTOBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public CommunityResourceDTOBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public CommunityResourceDTO build() {
            return new CommunityResourceDTO(id, title, description, link, communityId, communityName, documentNames, documentUrls, createdAt, updatedAt);
        }
    }
}
