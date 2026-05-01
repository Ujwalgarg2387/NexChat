package com.nexchat.dto;

import com.nexchat.model.Message;
import lombok.Data;

@Data
public class SendMessageRequest {
    private String chatId;
    private String content;
    private Message.MessageType messageType = Message.MessageType.TEXT;
    private String fileUrl;
    private String fileName;
    private String fileSize;
    private String fileMimeType;
}
