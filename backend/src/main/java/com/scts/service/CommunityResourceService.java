package com.scts.service;

import com.scts.dto.CommunityResourceDTO;
import com.scts.entity.Community;
import com.scts.entity.CommunityResource;
import com.scts.exception.ResourceNotFoundException;
import com.scts.repository.CommunityRepository;
import com.scts.repository.CommunityResourceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class CommunityResourceService {

    private final CommunityResourceRepository resourceRepository;
    private final CommunityRepository communityRepository;

    private static final String UPLOAD_DIR = "uploads/resources";

    @Autowired
    public CommunityResourceService(CommunityResourceRepository resourceRepository, CommunityRepository communityRepository) {
        this.resourceRepository = resourceRepository;
        this.communityRepository = communityRepository;
    }

    public List<CommunityResourceDTO> getResourcesByCommunity(Long communityId) {
        return resourceRepository.findByCommunityId(communityId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public CommunityResourceDTO getResourceById(Long id) {
        CommunityResource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CommunityResource", "id", id));
        return mapToDTO(resource);
    }

    @Transactional
    public CommunityResourceDTO createResource(String title, String description, String link, Long communityId, MultipartFile[] files) throws IOException {
        Community community = communityRepository.findById(communityId)
                .orElseThrow(() -> new ResourceNotFoundException("Community", "id", communityId));

        File dir = new File(UPLOAD_DIR);
        if (!dir.exists()) {
            dir.mkdirs();
        }

        List<String> originalNames = new ArrayList<>();
        List<String> storedPaths = new ArrayList<>();

        if (files != null) {
            for (MultipartFile file : files) {
                if (file.isEmpty()) continue;
                String originalFilename = file.getOriginalFilename();
                String fileExtension = originalFilename != null && originalFilename.contains(".")
                        ? originalFilename.substring(originalFilename.lastIndexOf(".")) : "";
                String storedFileName = UUID.randomUUID().toString() + fileExtension;
                Path filePath = Paths.get(UPLOAD_DIR, storedFileName);

                Files.copy(file.getInputStream(), filePath);

                originalNames.add(originalFilename != null ? originalFilename.replace(",", "_") : "document");
                storedPaths.add(filePath.toString());
            }
        }

        CommunityResource resource = new CommunityResource();
        resource.setTitle(title);
        resource.setDescription(description);
        resource.setLink(link);
        resource.setCommunity(community);
        resource.setDocumentNames(String.join(",", originalNames));
        resource.setDocumentPaths(String.join(",", storedPaths));

        CommunityResource saved = resourceRepository.save(resource);
        return mapToDTO(saved);
    }

    @Transactional
    public CommunityResourceDTO updateResource(Long id, String title, String description, String link, Long communityId, MultipartFile[] files) throws IOException {
        CommunityResource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CommunityResource", "id", id));

        Community community = communityRepository.findById(communityId)
                .orElseThrow(() -> new ResourceNotFoundException("Community", "id", communityId));

        resource.setTitle(title);
        resource.setDescription(description);
        resource.setLink(link);
        resource.setCommunity(community);

        if (files != null && files.length > 0 && !files[0].isEmpty()) {
            File dir = new File(UPLOAD_DIR);
            if (!dir.exists()) {
                dir.mkdirs();
            }

            if (resource.getDocumentPaths() != null) {
                for (String oldPath : resource.getDocumentPaths().split(",")) {
                    if (!oldPath.trim().isEmpty()) {
                        try {
                            Files.deleteIfExists(Paths.get(oldPath));
                        } catch (Exception ignored) {}
                    }
                }
            }

            List<String> originalNames = new ArrayList<>();
            List<String> storedPaths = new ArrayList<>();

            for (MultipartFile file : files) {
                if (file.isEmpty()) continue;
                String originalFilename = file.getOriginalFilename();
                String fileExtension = originalFilename != null && originalFilename.contains(".")
                        ? originalFilename.substring(originalFilename.lastIndexOf(".")) : "";
                String storedFileName = UUID.randomUUID().toString() + fileExtension;
                Path filePath = Paths.get(UPLOAD_DIR, storedFileName);

                Files.copy(file.getInputStream(), filePath);

                originalNames.add(originalFilename != null ? originalFilename.replace(",", "_") : "document");
                storedPaths.add(filePath.toString());
            }

            resource.setDocumentNames(String.join(",", originalNames));
            resource.setDocumentPaths(String.join(",", storedPaths));
        }

        CommunityResource saved = resourceRepository.save(resource);
        return mapToDTO(saved);
    }

    @Transactional
    public void deleteResource(Long id) {
        CommunityResource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CommunityResource", "id", id));

        if (resource.getDocumentPaths() != null) {
            for (String oldPath : resource.getDocumentPaths().split(",")) {
                if (!oldPath.trim().isEmpty()) {
                    try {
                        Files.deleteIfExists(Paths.get(oldPath));
                    } catch (Exception ignored) {}
                }
            }
        }

        resourceRepository.delete(resource);
    }

    private CommunityResourceDTO mapToDTO(CommunityResource r) {
        List<String> names = new ArrayList<>();
        List<String> urls = new ArrayList<>();

        if (r.getDocumentNames() != null && !r.getDocumentNames().isEmpty()) {
            names = Arrays.asList(r.getDocumentNames().split(","));
        }

        if (r.getDocumentPaths() != null && !r.getDocumentPaths().isEmpty()) {
            urls = Arrays.stream(r.getDocumentPaths().split(","))
                    .map(p -> "/uploads/resources/" + Paths.get(p).getFileName().toString())
                    .collect(Collectors.toList());
        }

        return CommunityResourceDTO.builder()
                .id(r.getId())
                .title(r.getTitle())
                .description(r.getDescription())
                .link(r.getLink())
                .communityId(r.getCommunity().getId())
                .communityName(r.getCommunity().getName())
                .documentNames(names)
                .documentUrls(urls)
                .createdAt(r.getCreatedAt())
                .updatedAt(r.getUpdatedAt())
                .build();
    }
}
