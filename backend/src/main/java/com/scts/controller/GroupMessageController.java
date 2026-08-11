package com.scts.controller;

import com.scts.entity.GroupMessage;
import com.scts.repository.GroupMessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/community-groups")
public class GroupMessageController {

    private final GroupMessageRepository groupMessageRepository;

    @Autowired
    public GroupMessageController(GroupMessageRepository groupMessageRepository) {
        this.groupMessageRepository = groupMessageRepository;
    }

    @GetMapping("/{groupId}/messages")
    public ResponseEntity<List<GroupMessage>> getGroupMessages(@PathVariable Long groupId) {
        return ResponseEntity.ok(groupMessageRepository.findByGroupIdOrderByTimestampAsc(groupId));
    }

    @PostMapping("/{groupId}/messages")
    public ResponseEntity<GroupMessage> postMessage(
            @PathVariable Long groupId,
            @RequestParam String senderName,
            @RequestParam String senderRole,
            @RequestBody String messageContent) {
        String cleanMessage = messageContent;
        if (cleanMessage.startsWith("\"") && cleanMessage.endsWith("\"")) {
            cleanMessage = cleanMessage.substring(1, cleanMessage.length() - 1);
        }
        GroupMessage msg = new GroupMessage(groupId, senderName, senderRole, cleanMessage);
        return ResponseEntity.ok(groupMessageRepository.save(msg));
    }
}
