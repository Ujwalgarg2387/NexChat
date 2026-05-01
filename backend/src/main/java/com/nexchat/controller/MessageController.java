package com.nexchat.controller;

import com.nexchat.dto.MessageDto;
import com.nexchat.dto.SendMessageRequest;
import com.nexchat.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;

    @PostMapping
    public ResponseEntity<MessageDto> sendMessage(
            @RequestBody SendMessageRequest request,
            @AuthenticationPrincipal UserDetails ud) throws Exception {
        return ResponseEntity.ok(messageService.sendMessage(ud.getUsername(), request));
    }

    @GetMapping("/{chatId}")
    public ResponseEntity<List<MessageDto>> getChatMessages(
            @PathVariable String chatId,
            @AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(messageService.getChatMessages(ud.getUsername(), chatId));
    }

    @PutMapping("/{chatId}/read")
    public ResponseEntity<Void> markAsRead(
            @PathVariable String chatId,
            @AuthenticationPrincipal UserDetails ud) {
        messageService.markMessagesAsRead(ud.getUsername(), chatId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{chatId}/clear")
    public ResponseEntity<Void> clearHistory(
            @PathVariable String chatId,
            @AuthenticationPrincipal UserDetails ud) {
        messageService.clearChatHistory(ud.getUsername(), chatId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/message/{messageId}")
    public ResponseEntity<Void> deleteMessage(
            @PathVariable String messageId,
            @AuthenticationPrincipal UserDetails ud) throws Exception {
        messageService.deleteMessage(ud.getUsername(), messageId);
        return ResponseEntity.ok().build();
    }
}
