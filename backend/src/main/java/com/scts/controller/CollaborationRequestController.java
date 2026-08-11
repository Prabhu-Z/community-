package com.scts.controller;

import com.scts.dto.CollaborationRequestDTO;
import com.scts.entity.*;
import com.scts.repository.*;
import com.scts.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/collaboration-requests")
public class CollaborationRequestController {

    private final CollaborationRequestRepository requestRepository;
    private final EventRepository eventRepository;
    private final CommunityRepository communityRepository;
    private final StudentRepository studentRepository;
    private final EventRegistrationRepository registrationRepository;
    private final NotificationService notificationService;

    @Autowired
    public CollaborationRequestController(
            CollaborationRequestRepository requestRepository,
            EventRepository eventRepository,
            CommunityRepository communityRepository,
            StudentRepository studentRepository,
            EventRegistrationRepository registrationRepository,
            NotificationService notificationService) {
        this.requestRepository = requestRepository;
        this.eventRepository = eventRepository;
        this.communityRepository = communityRepository;
        this.studentRepository = studentRepository;
        this.registrationRepository = registrationRepository;
        this.notificationService = notificationService;
    }

    @PostMapping
    @Transactional
    public ResponseEntity<CollaborationRequestDTO> createRequest(
            @RequestParam Long eventId,
            @RequestParam Long targetCommunityId,
            @RequestParam(required = false) String message) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Event not found with ID: " + eventId));
        
        Community targetCommunity = communityRepository.findById(targetCommunityId)
                .orElseThrow(() -> new IllegalArgumentException("Target Community not found with ID: " + targetCommunityId));
        
        Community requestingCommunity = event.getCommunity();

        CollaborationRequest request = CollaborationRequest.builder()
                .event(event)
                .requestingCommunity(requestingCommunity)
                .targetCommunity(targetCommunity)
                .status("PENDING")
                .message(message)
                .nominatedStudents(new ArrayList<>())
                .build();

        CollaborationRequest saved = requestRepository.save(request);
        return ResponseEntity.ok(mapToDTO(saved));
    }

    @GetMapping("/incoming/{communityId}")
    public ResponseEntity<List<CollaborationRequestDTO>> getIncomingRequests(@PathVariable Long communityId) {
        List<CollaborationRequest> list = requestRepository.findByTargetCommunityIdAndStatus(communityId, "PENDING");
        List<CollaborationRequestDTO> dtos = list.stream().map(this::mapToDTO).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @PostMapping("/{requestId}/approve")
    @Transactional
    public ResponseEntity<CollaborationRequestDTO> approveRequest(
            @PathVariable Long requestId,
            @RequestBody List<Long> studentIds) {
        CollaborationRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Request not found with ID: " + requestId));
        
        List<Student> nominated = studentRepository.findAllById(studentIds);
        request.setNominatedStudents(nominated);
        request.setStatus("APPROVED");

        // Automatically register each student to the hosted event
        Event event = request.getEvent();
        for (Student student : nominated) {
            boolean exists = registrationRepository.existsByEventIdAndStudentId(event.getId(), student.getId());
            if (!exists) {
                EventRegistration reg = EventRegistration.builder()
                        .event(event)
                        .student(student)
                        .status("NOMINATED")
                        .registrationDate(LocalDateTime.now())
                        .build();
                registrationRepository.save(reg);
            }

            // Notify the student
            notificationService.createNotification(
                    student.getUser().getId(),
                    "Nominated for " + event.getTitle(),
                    "You have been chosen by your Community Coordinator to participate in the event: " + event.getTitle() + " (hosted by " + request.getRequestingCommunity().getName() + ").",
                    "EVENT_NOMINATION"
            );
        }

        CollaborationRequest saved = requestRepository.save(request);
        return ResponseEntity.ok(mapToDTO(saved));
    }

    @PostMapping("/{requestId}/reject")
    @Transactional
    public ResponseEntity<CollaborationRequestDTO> rejectRequest(@PathVariable Long requestId) {
        CollaborationRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Request not found with ID: " + requestId));
        
        request.setStatus("REJECTED");
        CollaborationRequest saved = requestRepository.save(request);
        return ResponseEntity.ok(mapToDTO(saved));
    }

    private CollaborationRequestDTO mapToDTO(CollaborationRequest req) {
        List<String> names = req.getNominatedStudents().stream()
                .map(Student::getName)
                .collect(Collectors.toList());

        return new CollaborationRequestDTO(
                req.getId(),
                req.getEvent().getId(),
                req.getEvent().getTitle(),
                req.getEvent().getEventDate() != null ? req.getEvent().getEventDate().toString() : "",
                req.getEvent().getTime(),
                req.getEvent().getVenue(),
                req.getEvent().getDescription(),
                req.getRequestingCommunity().getId(),
                req.getRequestingCommunity().getName(),
                req.getTargetCommunity().getId(),
                req.getTargetCommunity().getName(),
                req.getStatus(),
                req.getMessage(),
                names,
                req.getCreatedAt()
        );
    }
}
