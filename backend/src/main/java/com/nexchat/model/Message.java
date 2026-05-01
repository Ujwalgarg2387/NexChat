package com.nexchat.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;

import java.time.Instant;
import java.util.List;
import java.util.ArrayList;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "messages")
public class Message {
    @Id
    private String id;

    @DBRef
    private User sender;

    // Encrypted message content (AES-256-GCM)
    private String content;

    // IV for AES-GCM decryption (Base64)
    private String iv;

    @DBRef
    private Chat chat;

    private MessageType messageType = MessageType.TEXT;

    // File metadata
    private String fileUrl;
    private String fileName;
    private String fileSize;
    private String fileMimeType;
    private String thumbnailUrl;

    @DBRef
    private List<User> readBy = new ArrayList<>();

    private boolean deleted = false;
    private String deletedFor; // "everyone" or userId

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;

    public enum MessageType {
        TEXT, IMAGE, VIDEO, DOCUMENT, AUDIO, SYSTEM
    }
}
