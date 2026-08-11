package com.scts.controller;

import com.scts.dto.EventDTO;
import com.scts.dto.EventRegistrationDTO;
import com.scts.service.EventService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/events")
public class EventController {

    private final EventService eventService;

    @Autowired
    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    @GetMapping
    public ResponseEntity<List<EventDTO>> getAllEvents(@RequestParam(required = false) Long studentId) {
        return ResponseEntity.ok(eventService.getAllEvents(studentId));
    }

    @GetMapping("/upcoming")
    public ResponseEntity<List<EventDTO>> getUpcomingEvents() {
        return ResponseEntity.ok(eventService.getUpcomingEvents());
    }

    @GetMapping("/pending")
    public ResponseEntity<List<EventDTO>> getPendingProposals(@RequestParam(required = false) Long communityId) {
        return ResponseEntity.ok(eventService.getPendingProposals(communityId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<EventDTO> getEventById(@PathVariable Long id, @RequestParam(required = false) Long studentId) {
        return ResponseEntity.ok(eventService.getEventById(id, studentId));
    }

    @GetMapping("/{id}/registrations")
    public ResponseEntity<List<EventRegistrationDTO>> getEventRegistrations(@PathVariable Long id) {
        return ResponseEntity.ok(eventService.getEventRegistrations(id));
    }

    @GetMapping("/student/{studentId}/registrations")
    public ResponseEntity<List<EventRegistrationDTO>> getStudentRegistrations(@PathVariable Long studentId) {
        return ResponseEntity.ok(eventService.getStudentRegistrations(studentId));
    }

    @PostMapping
    public ResponseEntity<EventDTO> createEvent(@RequestBody EventDTO dto) {
        return ResponseEntity.ok(eventService.createEvent(dto));
    }

    @PostMapping("/propose")
    public ResponseEntity<EventDTO> proposeEvent(
            @RequestBody EventDTO dto,
            @RequestParam(required = false) String leaderStudentName) {
        return ResponseEntity.ok(eventService.proposeEvent(dto, leaderStudentName));
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<EventDTO> approveEventProposal(@PathVariable Long id) {
        return ResponseEntity.ok(eventService.approveEventProposal(id));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<EventDTO> rejectEventProposal(@PathVariable Long id) {
        return ResponseEntity.ok(eventService.rejectEventProposal(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EventDTO> updateEvent(@PathVariable Long id, @RequestBody EventDTO dto) {
        return ResponseEntity.ok(eventService.updateEvent(id, dto));
    }

    @PostMapping("/{id}/register")
    public ResponseEntity<String> registerForEvent(@PathVariable Long id, @RequestParam Long studentId) {
        return ResponseEntity.ok(eventService.registerStudentForEvent(id, studentId));
    }
}
