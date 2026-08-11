package com.scts.service;

import com.scts.dto.EventDTO;
import com.scts.dto.EventRegistrationDTO;
import com.scts.entity.*;
import com.scts.exception.BadRequestException;
import com.scts.exception.ResourceNotFoundException;
import com.scts.repository.CommunityRepository;
import com.scts.repository.EventRegistrationRepository;
import com.scts.repository.EventRepository;
import com.scts.repository.MembershipRepository;
import com.scts.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class EventService {

    private final EventRepository eventRepository;
    private final CommunityRepository communityRepository;
    private final StudentRepository studentRepository;
    private final EventRegistrationRepository registrationRepository;
    private final MembershipRepository membershipRepository;
    private final NotificationService notificationService;

    @Autowired
    public EventService(EventRepository eventRepository, CommunityRepository communityRepository, StudentRepository studentRepository, EventRegistrationRepository registrationRepository, MembershipRepository membershipRepository, NotificationService notificationService) {
        this.eventRepository = eventRepository;
        this.communityRepository = communityRepository;
        this.studentRepository = studentRepository;
        this.registrationRepository = registrationRepository;
        this.membershipRepository = membershipRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public List<EventDTO> getAllEvents() {
        return getAllEvents(null);
    }

    @Transactional
    public List<EventDTO> getAllEvents(Long studentId) {
        return eventRepository.findAll().stream()
                .map(e -> mapToDTO(e, studentId))
                .collect(Collectors.toList());
    }

    @Transactional
    public List<EventDTO> getUpcomingEvents() {
        return eventRepository.findByStatus(EventStatus.UPCOMING).stream()
                .map(e -> mapToDTO(e, null))
                .collect(Collectors.toList());
    }

    @Transactional
    public List<EventDTO> getPendingProposals(Long communityId) {
        if (communityId != null) {
            return eventRepository.findByStatus(EventStatus.PENDING_APPROVAL).stream()
                    .filter(e -> e.getCommunity().getId().equals(communityId))
                    .map(e -> mapToDTO(e, null))
                    .collect(Collectors.toList());
        }
        return eventRepository.findByStatus(EventStatus.PENDING_APPROVAL).stream()
                .map(e -> mapToDTO(e, null))
                .collect(Collectors.toList());
    }

    public List<EventRegistrationDTO> getEventRegistrations(Long eventId) {
        return registrationRepository.findByEventId(eventId).stream()
                .map(r -> new EventRegistrationDTO(
                        r.getId(),
                        r.getStudent().getId(),
                        r.getStudent().getName(),
                        r.getStudent().getStudentCode(),
                        r.getStudent().getDepartment(),
                        r.getEvent().getId(),
                        r.getEvent().getTitle(),
                        r.getEvent().getEventType() != null ? r.getEvent().getEventType().name() : "EVENT",
                        r.getEvent().getEventScope(),
                        r.getEvent().getCommunity().getName(),
                        r.getEvent().getVenue(),
                        r.getEvent().getEventDate(),
                        r.getEvent().getTime(),
                        r.getRegistrationDate(),
                        r.getStatus()
                ))
                .collect(Collectors.toList());
    }

    public List<EventRegistrationDTO> getStudentRegistrations(Long studentId) {
        return registrationRepository.findByStudentId(studentId).stream()
                .map(r -> new EventRegistrationDTO(
                        r.getId(),
                        r.getStudent().getId(),
                        r.getStudent().getName(),
                        r.getStudent().getStudentCode(),
                        r.getStudent().getDepartment(),
                        r.getEvent().getId(),
                        r.getEvent().getTitle(),
                        r.getEvent().getEventType() != null ? r.getEvent().getEventType().name() : "EVENT",
                        r.getEvent().getEventScope(),
                        r.getEvent().getCommunity().getName(),
                        r.getEvent().getVenue(),
                        r.getEvent().getEventDate(),
                        r.getEvent().getTime(),
                        r.getRegistrationDate(),
                        r.getStatus()
                ))
                .collect(Collectors.toList());
    }

    public EventDTO getEventById(Long id, Long studentId) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event", "id", id));
        return mapToDTO(event, studentId);
    }

    @Transactional
    public EventDTO createEvent(EventDTO dto) {
        Long targetCommunityId = dto.getCommunityId() != null ? dto.getCommunityId() : 1L;
        Community community = communityRepository.findById(targetCommunityId)
                .orElseGet(() -> communityRepository.findAll().stream().findFirst()
                        .orElseThrow(() -> new ResourceNotFoundException("Community", "id", targetCommunityId)));

        String scope = dto.getEventScope() != null ? dto.getEventScope() : "COMMUNITY_EVENT";

        String otp = String.format("%04d", new java.util.Random().nextInt(10000));
        Event event = Event.builder()
                .community(community)
                .title(dto.getTitle())
                .description(dto.getDescription())
                .eventType(dto.getEventType())
                .eventScope(scope)
                .venue(dto.getVenue())
                .eventDate(dto.getEventDate())
                .time(dto.getTime())
                .duration(dto.getDuration() != null ? dto.getDuration() : "2 Hours")
                .registrationDeadline(dto.getRegistrationDeadline())
                .maxParticipants(dto.getMaxParticipants())
                .status(dto.getStatus() != null ? dto.getStatus() : EventStatus.UPCOMING)
                .coordinatorName(dto.getCoordinatorName() != null ? dto.getCoordinatorName() : community.getStudentCoordinator())
                .otpCode(otp)
                .build();

        Event saved = eventRepository.save(event);
        notifyCommunityMembers(community, saved);
        return mapToDTO(saved, null);
    }

    @Transactional
    public EventDTO proposeEvent(EventDTO dto, String leaderStudentName) {
        Long targetCommunityId = dto.getCommunityId() != null ? dto.getCommunityId() : 1L;
        Community community = communityRepository.findById(targetCommunityId)
                .orElseGet(() -> communityRepository.findAll().stream().findFirst()
                        .orElseThrow(() -> new ResourceNotFoundException("Community", "id", targetCommunityId)));

        String scope = dto.getEventScope() != null ? dto.getEventScope() : "COMMUNITY_EVENT";

        String otp = String.format("%04d", new java.util.Random().nextInt(10000));
        Event event = Event.builder()
                .community(community)
                .title(dto.getTitle())
                .description(dto.getDescription())
                .eventType(dto.getEventType() != null ? dto.getEventType() : EventType.WORKSHOP)
                .eventScope(scope)
                .venue(dto.getVenue())
                .eventDate(dto.getEventDate())
                .time(dto.getTime() != null ? dto.getTime() : "10:00 AM")
                .duration(dto.getDuration() != null ? dto.getDuration() : "2 Hours")
                .registrationDeadline(dto.getRegistrationDeadline() != null ? dto.getRegistrationDeadline() : dto.getEventDate())
                .maxParticipants(dto.getMaxParticipants() != null ? dto.getMaxParticipants() : 100)
                .status(EventStatus.PENDING_APPROVAL)
                .coordinatorName(leaderStudentName != null ? "Proposed by Student Leader: " + leaderStudentName : "Student Leader Proposal")
                .otpCode(otp)
                .build();

        Event saved = eventRepository.save(event);

        if (community.getCoordinatorUserId() != null) {
            notificationService.createNotification(
                    community.getCoordinatorUserId(),
                    "New Event Proposal Received!",
                    "Student Leader " + (leaderStudentName != null ? leaderStudentName : "") + " has proposed event: " + dto.getTitle() + ".",
                    "EVENT_PROPOSAL"
            );
        }

        return mapToDTO(saved, null);
    }

    @Transactional
    public EventDTO approveEventProposal(Long id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event", "id", id));

        if (event.getOtpCode() == null || event.getOtpCode().isEmpty()) {
            event.setOtpCode(String.format("%04d", new java.util.Random().nextInt(10000)));
        }
        event.setStatus(EventStatus.UPCOMING);
        Event updated = eventRepository.save(event);
        notifyCommunityMembers(event.getCommunity(), updated);
        return mapToDTO(updated, null);
    }

    @Transactional
    public EventDTO rejectEventProposal(Long id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event", "id", id));

        event.setStatus(EventStatus.REJECTED);
        Event updated = eventRepository.save(event);
        return mapToDTO(updated, null);
    }

    @Transactional
    public EventDTO updateEvent(Long id, EventDTO dto) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event", "id", id));

        event.setTitle(dto.getTitle());
        event.setDescription(dto.getDescription());
        event.setEventType(dto.getEventType());
        if (dto.getEventScope() != null) {
            event.setEventScope(dto.getEventScope());
        }
        event.setVenue(dto.getVenue());
        event.setEventDate(dto.getEventDate());
        event.setTime(dto.getTime());
        event.setDuration(dto.getDuration());
        event.setRegistrationDeadline(dto.getRegistrationDeadline());
        event.setMaxParticipants(dto.getMaxParticipants());
        event.setStatus(dto.getStatus());
        event.setCoordinatorName(dto.getCoordinatorName());

        Event updated = eventRepository.save(event);
        return mapToDTO(updated, null);
    }

    @Transactional
    public String registerStudentForEvent(Long eventId, Long studentId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event", "id", eventId));

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", studentId));

        // Enforce Community Event Scope (Respective Community Members ONLY)
        if ("COMMUNITY_EVENT".equalsIgnoreCase(event.getEventScope())) {
            boolean isMember = membershipRepository.findByCommunityIdAndStatus(event.getCommunity().getId(), MembershipStatus.APPROVED)
                    .stream()
                    .anyMatch(m -> m.getStudent().getId().equals(studentId));

            if (!isMember) {
                throw new BadRequestException("Registration Restricted: This is a private Community Event for members of " + event.getCommunity().getName() + " only. Please join the community first to participate.");
            }
        }

        if (registrationRepository.existsByEventIdAndStudentId(eventId, studentId)) {
            throw new BadRequestException("Student is already registered for this event.");
        }

        if (event.getRegistrationDeadline() != null && java.time.LocalDate.now().isAfter(event.getRegistrationDeadline())) {
            throw new BadRequestException("The registration deadline for this event has passed.");
        }

        if (event.getStatus() != EventStatus.UPCOMING) {
            throw new BadRequestException("Registration is closed for this event.");
        }

        long currentCount = registrationRepository.countByEventId(eventId);
        if (event.getMaxParticipants() != null && currentCount >= event.getMaxParticipants()) {
            throw new BadRequestException("Event registration capacity limit reached.");
        }

        EventRegistration registration = EventRegistration.builder()
                .event(event)
                .student(student)
                .status("REGISTERED")
                .build();

        registrationRepository.save(registration);

        notificationService.createNotification(
                student.getUser().getId(),
                "Event Registration Successful! (+1 Pt)",
                "You registered for " + event.getTitle() + " (" + ("GLOBAL_EVENT".equalsIgnoreCase(event.getEventScope()) ? "Global Campus Event" : "Community Event") + ") (+1 Point awarded).",
                "EVENT"
        );

        return "Successfully registered for event!";
    }

    private void notifyCommunityMembers(Community community, Event event) {
        if (community == null || event == null) return;

        List<Membership> approvedMembers = membershipRepository.findByCommunityIdAndStatus(community.getId(), MembershipStatus.APPROVED);
        for (Membership m : approvedMembers) {
            if (m.getStudent() != null && m.getStudent().getUser() != null) {
                notificationService.createNotification(
                        m.getStudent().getUser().getId(),
                        "🎉 New Event: " + event.getTitle(),
                        "A new " + ("GLOBAL_EVENT".equalsIgnoreCase(event.getEventScope()) ? "Global Campus Event" : "Community Event") + " '" + event.getTitle() + "' was published for " + community.getName() + ". Register now on your Events page!",
                        "EVENT"
                );
            }
        }
    }

    private EventDTO mapToDTO(Event e, Long studentId) {
        long regCount = registrationRepository.countByEventId(e.getId());
        boolean isRegistered = false;
        String regStatus = null;
        if (studentId != null) {
            java.util.Optional<EventRegistration> regOpt = registrationRepository.findByEventIdAndStudentId(e.getId(), studentId);
            if (regOpt.isPresent()) {
                isRegistered = true;
                regStatus = regOpt.get().getStatus();
            }
        }

        String otp = e.getOtpCode();
        if (otp == null || otp.isEmpty()) {
            otp = String.format("%04d", new java.util.Random().nextInt(10000));
            e.setOtpCode(otp);
            try {
                eventRepository.save(e);
            } catch (Exception ex) {
                // Ignore read-only transaction exceptions
            }
        }

        return EventDTO.builder()
                .id(e.getId())
                .communityId(e.getCommunity().getId())
                .communityName(e.getCommunity().getName())
                .title(e.getTitle())
                .description(e.getDescription())
                .eventType(e.getEventType())
                .eventScope(e.getEventScope())
                .venue(e.getVenue())
                .eventDate(e.getEventDate())
                .time(e.getTime())
                .duration(e.getDuration())
                .registrationDeadline(e.getRegistrationDeadline())
                .maxParticipants(e.getMaxParticipants())
                .currentRegistrations(regCount)
                .status(e.getStatus())
                .coordinatorName(e.getCoordinatorName())
                .proposedByName(e.getCoordinatorName())
                .isUserRegistered(isRegistered)
                .userRegistrationStatus(regStatus)
                .otpCode(otp)
                .build();
    }
}
