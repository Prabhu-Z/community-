package com.scts.service;

import com.scts.dto.AttendanceDTO;
import com.scts.entity.Attendance;
import com.scts.entity.Event;
import com.scts.entity.Student;
import com.scts.exception.ResourceNotFoundException;
import com.scts.repository.AttendanceRepository;
import com.scts.repository.EventRepository;
import com.scts.repository.StudentRepository;
import com.scts.repository.EventRegistrationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final EventRepository eventRepository;
    private final StudentRepository studentRepository;
    private final EventRegistrationRepository registrationRepository;

    @Autowired
    public AttendanceService(AttendanceRepository attendanceRepository, EventRepository eventRepository, StudentRepository studentRepository, EventRegistrationRepository registrationRepository) {
        this.attendanceRepository = attendanceRepository;
        this.eventRepository = eventRepository;
        this.studentRepository = studentRepository;
        this.registrationRepository = registrationRepository;
    }

    public List<AttendanceDTO> getAttendanceByEvent(Long eventId) {
        return attendanceRepository.findByEventId(eventId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public List<AttendanceDTO> getAttendanceByStudent(Long studentId) {
        List<com.scts.entity.EventRegistration> registrations = registrationRepository.findByStudentId(studentId);
        
        return registrations.stream().map(reg -> {
            java.util.Optional<Attendance> attOpt = attendanceRepository.findByEventIdAndStudentId(reg.getEvent().getId(), studentId);
            if (attOpt.isPresent()) {
                return mapToDTO(attOpt.get());
            } else {
                return AttendanceDTO.builder()
                        .id(null)
                        .eventId(reg.getEvent().getId())
                        .eventTitle(reg.getEvent().getTitle())
                        .communityName(reg.getEvent().getCommunity().getName())
                        .studentId(studentId)
                        .studentName(reg.getStudent().getName())
                        .studentCode(reg.getStudent().getStudentCode())
                        .status("ABSENT")
                        .recordedTime(null)
                        .build();
            }
        }).collect(Collectors.toList());
    }

    @Transactional
    public AttendanceDTO recordAttendance(Long eventId, Long studentId, String status) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event", "id", eventId));
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", studentId));

        Attendance attendance = attendanceRepository.findByEventIdAndStudentId(eventId, studentId)
                .orElse(Attendance.builder()
                        .event(event)
                        .student(student)
                        .recordedTime(LocalDateTime.now())
                        .build());

        attendance.setStatus(status);
        attendance.setRecordedTime(LocalDateTime.now());

        Attendance saved = attendanceRepository.save(attendance);
        return mapToDTO(saved);
    }

    @Transactional
    public AttendanceDTO checkInStudent(Long eventId, Long studentId, String otp) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event", "id", eventId));

        if (event.getOtpCode() == null || !event.getOtpCode().equals(otp)) {
            throw new IllegalArgumentException("Invalid OTP Code for this event. Please verify the code displayed on the Coordinator's screen.");
        }

        return recordAttendance(eventId, studentId, "PRESENT");
    }

    private AttendanceDTO mapToDTO(Attendance a) {
        return AttendanceDTO.builder()
                .id(a.getId())
                .eventId(a.getEvent().getId())
                .eventTitle(a.getEvent().getTitle())
                .communityName(a.getEvent().getCommunity().getName())
                .studentId(a.getStudent().getId())
                .studentName(a.getStudent().getName())
                .studentCode(a.getStudent().getStudentCode())
                .status(a.getStatus())
                .recordedTime(a.getRecordedTime())
                .build();
    }
}
