package com.nexchat.websocket;

import com.nexchat.dto.TypingEvent;
import com.nexchat.dto.WebSocketMessage;
import com.nexchat.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.util.Map;

@Controller
@RequiredArgsConstructor
public class ChatWebSocketController {

    private final SimpMessagingTemplate messagingTemplate;
    private final UserService userService;

    @MessageMapping("/typing")
    public void handleTyping(@Payload TypingEvent event, Principal principal) {
        String email = principal.getName();
        userService.getUserByEmail(email);

        messagingTemplate.convertAndSend(
                "/topic/chat/" + event.getChatId() + "/typing",
                event);
    }

    @MessageMapping("/online")
    public void handleOnline(Principal principal) {
        if (principal == null) return;
        String email = principal.getName();
        userService.setUserOnline(email);

        var user = userService.getCurrentUser(email);
        messagingTemplate.convertAndSend("/topic/presence",
                new WebSocketMessage("USER_ONLINE", Map.of("userId", user.getId())));
    }

    @MessageMapping("/offline")
    public void handleOffline(Principal principal) {
        if (principal == null) return;
        String email = principal.getName();
        userService.setUserOffline(email);

        var user = userService.getCurrentUser(email);
        messagingTemplate.convertAndSend("/topic/presence",
                new WebSocketMessage("USER_OFFLINE",
                        Map.of("userId", user.getId(), "lastSeen", java.time.Instant.now().toString())));
    }
}
