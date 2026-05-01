package com.nexchat.dto;
import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TypingEvent {
    private String chatId;
    private String userId;
    private String username;
    private boolean typing;
}
