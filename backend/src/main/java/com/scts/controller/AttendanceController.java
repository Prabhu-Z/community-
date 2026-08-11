package com.scts.controller;

import com.scts.dto.AttendanceDTO;
import com.scts.service.AttendanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    private final AttendanceService attendanceService;

    @Autowired
    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    @GetMapping("/event/{eventId}")
    public ResponseEntity<List<AttendanceDTO>> getAttendanceByEvent(@PathVariable Long eventId) {
        return ResponseEntity.ok(attendanceService.getAttendanceByEvent(eventId));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<AttendanceDTO>> getAttendanceByStudent(@PathVariable Long studentId) {
        return ResponseEntity.ok(attendanceService.getAttendanceByStudent(studentId));
    }

    @PostMapping
    public ResponseEntity<AttendanceDTO> recordAttendance(
            @RequestParam Long eventId,
            @RequestParam Long studentId,
            @RequestParam String status) {
        return ResponseEntity.ok(attendanceService.recordAttendance(eventId, studentId, status));
    }

    @PostMapping("/check-in")
    public ResponseEntity<AttendanceDTO> checkInStudent(
            @RequestParam Long eventId,
            @RequestParam Long studentId,
            @RequestParam String otp) {
        return ResponseEntity.ok(attendanceService.checkInStudent(eventId, studentId, otp));
    }
}
