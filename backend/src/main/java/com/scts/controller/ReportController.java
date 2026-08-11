package com.scts.controller;

import com.scts.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;

    @Autowired
    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<Map<String, Object>> getStudentReport(@PathVariable Long studentId) {
        return ResponseEntity.ok(reportService.generateStudentReport(studentId));
    }

    @GetMapping("/community/{communityId}")
    public ResponseEntity<Map<String, Object>> getCommunityReport(@PathVariable Long communityId) {
        return ResponseEntity.ok(reportService.generateCommunityReport(communityId));
    }

    @GetMapping("/community/{communityId}/csv")
    public ResponseEntity<byte[]> getCommunityCsvReport(@PathVariable Long communityId) {
        String csv = reportService.getCommunityCsvReport(communityId);
        byte[] csvBytes = csv.getBytes(java.nio.charset.StandardCharsets.UTF_8);
        return ResponseEntity.ok()
                .header("Content-Type", "text/csv; charset=UTF-8")
                .header("Content-Disposition", "attachment; filename=\"community_report.csv\"")
                .body(csvBytes);
    }

    @GetMapping("/all/csv")
    public ResponseEntity<byte[]> getAllCommunitiesCsvReport() {
        String csv = reportService.getAllCommunitiesCsvReport();
        byte[] csvBytes = csv.getBytes(java.nio.charset.StandardCharsets.UTF_8);
        return ResponseEntity.ok()
                .header("Content-Type", "text/csv; charset=UTF-8")
                .header("Content-Disposition", "attachment; filename=\"all_communities_report.csv\"")
                .body(csvBytes);
    }

    @GetMapping("/student/{studentId}/csv")
    public ResponseEntity<byte[]> getStudentCsvReport(@PathVariable Long studentId) {
        String csv = reportService.getStudentCsvReport(studentId);
        byte[] csvBytes = csv.getBytes(java.nio.charset.StandardCharsets.UTF_8);
        return ResponseEntity.ok()
                .header("Content-Type", "text/csv; charset=UTF-8")
                .header("Content-Disposition", "attachment; filename=\"student_transcript.csv\"")
                .body(csvBytes);
    }
}
