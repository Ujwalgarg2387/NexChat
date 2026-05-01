package com.nexchat.dto;

import com.nexchat.model.Chat;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
public class ChatDto {
    private String id;
    private String chatName;
    @JsonProperty("isGroupChat")
    private boolean isGroupChat;
    private String groupPicture;
    private String groupDescription;
    private UserDto groupAdmin;
    private List<UserDto> users;
    private MessageDto latestMessage;
    private String createdAt;

    public ChatDto(Chat chat, MessageDto latestMessage) {
        this.id = chat.getId();
        this.chatName = chat.getChatName();
        this.isGroupChat = chat.isGroupChat();
        this.groupPicture = chat.getGroupPicture();
        this.groupDescription = chat.getGroupDescription();
        this.groupAdmin = chat.getGroupAdmin() != null ? new UserDto(chat.getGroupAdmin()) : null;
        this.users = chat.getUsers() != null
            ? chat.getUsers().stream().map(UserDto::new).collect(Collectors.toList())
            : List.of();
        this.latestMessage = latestMessage;
        this.createdAt = chat.getCreatedAt() != null ? chat.getCreatedAt().toString() : null;
    }
}
