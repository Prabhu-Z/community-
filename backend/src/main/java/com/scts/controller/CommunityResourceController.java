package com.scts.controller;

import com.scts.dto.CommunityResourceDTO;
import com.scts.service.CommunityResourceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/resources")
public class CommunityResourceController {

    private final CommunityResourceService resourceService;

    @Autowired
    public CommunityResourceController(CommunityResourceService resourceService) {
        this.resourceService = resourceService;
    }

    @GetMapping("/community/{communityId}")
    public ResponseEntity<List<CommunityResourceDTO>> getResourcesByCommunity(@PathVariable Long communityId) {
        return ResponseEntity.ok(resourceService.getResourcesByCommunity(communityId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CommunityResourceDTO> getResourceById(@PathVariable Long id) {
        return ResponseEntity.ok(resourceService.getResourceById(id));
    }

    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<CommunityResourceDTO> createResource(
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam(value = "link", required = false) String link,
            @RequestParam("communityId") Long communityId,
            @RequestParam(value = "files", required = false) MultipartFile[] files) throws IOException {
        return ResponseEntity.ok(resourceService.createResource(title, description, link, communityId, files));
    }

    @PutMapping(value = "/{id}", consumes = {"multipart/form-data"})
    public ResponseEntity<CommunityResourceDTO> updateResource(
            @PathVariable Long id,
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam(value = "link", required = false) String link,
            @RequestParam("communityId") Long communityId,
            @RequestParam(value = "files", required = false) MultipartFile[] files) throws IOException {
        return ResponseEntity.ok(resourceService.updateResource(id, title, description, link, communityId, files));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteResource(@PathVariable Long id) {
        resourceService.deleteResource(id);
        return ResponseEntity.noContent().build();
    }
}
