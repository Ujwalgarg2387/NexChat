package com.nexchat.dto;

import com.nexchat.model.Message;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
public class MessageDto {
    private String id;
    private UserDto sender;
    private String content;
    private String chatId;
    private Message.MessageType messageType;
    private String fileUrl;
    private String fileName;
    private String fileSize;
    private String fileMimeType;
    private String thumbnailUrl;
    private List<String> readBy;
    private boolean deleted;
    private String createdAt;
    private String updatedAt;

    public MessageDto(Message message, String decryptedContent) {
        this.id = message.getId();
        this.sender = message.getSender() != null ? new UserDto(message.getSender()) : null;
        this.content = decryptedContent;
        this.chatId = message.getChat() != null ? message.getChat().getId() : null;
        this.messageType = message.getMessageType();
        this.fileUrl = message.getFileUrl();
        this.fileName = message.getFileName();
        this.fileSize = message.getFileSize();
        this.fileMimeType = message.getFileMimeType();
        this.thumbnailUrl = message.getThumbnailUrl();
        this.readBy = message.getReadBy() != null
            ? message.getReadBy().stream().map(u -> u.getId()).collect(Collectors.toList())
            : List.of();
        this.deleted = message.isDeleted();
        this.createdAt = message.getCreatedAt() != null ? message.getCreatedAt().toString() : null;
        this.updatedAt = message.getUpdatedAt() != null ? message.getUpdatedAt().toString() : null;
    }
}
