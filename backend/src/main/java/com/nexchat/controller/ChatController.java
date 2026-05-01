package com.nexchat.controller;

import com.nexchat.dto.ChatDto;
import com.nexchat.dto.CreateGroupRequest;
import com.nexchat.service.ChatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chats")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @PostMapping
    public ResponseEntity<ChatDto> accessChat(
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(chatService.accessOrCreateOneOnOne(ud.getUsername(), body.get("userId")));
    }

    @GetMapping
    public ResponseEntity<List<ChatDto>> getUserChats(@AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(chatService.getUserChats(ud.getUsername()));
    }

    @PostMapping("/group")
    public ResponseEntity<ChatDto> createGroup(
            @Valid @RequestBody CreateGroupRequest request,
            @AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(chatService.createGroup(ud.getUsername(), request));
    }

    @PutMapping("/group/{chatId}/add")
    public ResponseEntity<ChatDto> addToGroup(
            @PathVariable String chatId,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(chatService.addToGroup(ud.getUsername(), chatId, body.get("userId")));
    }

    @PutMapping("/group/{chatId}/remove")
    public ResponseEntity<ChatDto> removeFromGroup(
            @PathVariable String chatId,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(chatService.removeFromGroup(ud.getUsername(), chatId, body.get("userId")));
    }

    @PutMapping("/group/{chatId}/rename")
    public ResponseEntity<ChatDto> renameGroup(
            @PathVariable String chatId,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(chatService.renameGroup(ud.getUsername(), chatId, body.get("chatName")));
    }

    @DeleteMapping("/{chatId}")
    public ResponseEntity<Void> deleteChat(
            @PathVariable String chatId,
            @AuthenticationPrincipal UserDetails ud) {
        chatService.deleteChat(ud.getUsername(), chatId);
        return ResponseEntity.ok().build();
    }
}
