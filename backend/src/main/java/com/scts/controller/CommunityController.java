package com.scts.controller;

import com.scts.dto.BulkImportResultDTO;
import com.scts.dto.CommunityDTO;
import com.scts.service.CommunityService;
import com.scts.service.StudentImportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/communities")
public class CommunityController {

    private final CommunityService communityService;
    private final StudentImportService studentImportService;

    @Autowired
    public CommunityController(CommunityService communityService, StudentImportService studentImportService) {
        this.communityService = communityService;
        this.studentImportService = studentImportService;
    }

    @GetMapping
    public ResponseEntity<List<CommunityDTO>> getAllCommunities() {
        return ResponseEntity.ok(communityService.getAllCommunities());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CommunityDTO> getCommunityById(@PathVariable Long id) {
        return ResponseEntity.ok(communityService.getCommunityById(id));
    }

    @PostMapping
    public ResponseEntity<CommunityDTO> createCommunity(@RequestBody CommunityDTO dto) {
        return ResponseEntity.ok(communityService.createCommunity(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CommunityDTO> updateCommunity(@PathVariable Long id, @RequestBody CommunityDTO dto) {
        return ResponseEntity.ok(communityService.updateCommunity(id, dto));
    }

    @PutMapping("/{id}/remove-coordinator")
    public ResponseEntity<CommunityDTO> removeCoordinatorFromCommunity(@PathVariable Long id) {
        return ResponseEntity.ok(communityService.removeCoordinator(id));
    }

    @PostMapping("/{id}/import-students")
    public ResponseEntity<BulkImportResultDTO> importStudentsToCommunity(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        BulkImportResultDTO result = studentImportService.importStudentsToCommunity(id, file);
        return ResponseEntity.ok(result);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCommunity(@PathVariable Long id) {
        communityService.deleteCommunity(id);
        return ResponseEntity.noContent().build();
    }
}
