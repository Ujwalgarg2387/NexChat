package com.nexchat.service;

import com.nexchat.dto.MessageDto;
import com.nexchat.dto.SendMessageRequest;
import com.nexchat.dto.WebSocketMessage;
import com.nexchat.exception.ResourceNotFoundException;
import com.nexchat.exception.UnauthorizedException;
import com.nexchat.model.Chat;
import com.nexchat.model.Message;
import com.nexchat.model.User;
import com.nexchat.repository.ChatRepository;
import com.nexchat.repository.MessageRepository;
import com.nexchat.util.EncryptionUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepository;
    private final ChatRepository chatRepository;
    private final UserService userService;
    private final EncryptionUtil encryptionUtil;
    private final SimpMessagingTemplate messagingTemplate;

    public MessageDto sendMessage(String senderEmail, SendMessageRequest request) throws Exception {
        User sender = userService.getUserByEmail(senderEmail);
        Chat chat = chatRepository.findById(request.getChatId())
                .orElseThrow(() -> new ResourceNotFoundException("Chat not found"));

        boolean isMember = chat.getUsers().stream().anyMatch(u -> u.getId().equals(sender.getId()));
        if (!isMember) throw new UnauthorizedException("You are not a member of this chat");

        Message message = new Message();
        message.setSender(sender);
        message.setChat(chat);
        message.setMessageType(request.getMessageType() != null
                ? request.getMessageType() : Message.MessageType.TEXT);

        // Encrypt text messages
        if (message.getMessageType() == Message.MessageType.TEXT) {
            String[] encrypted = encryptionUtil.encrypt(request.getContent());
            message.setContent(encrypted[0]);
            message.setIv(encrypted[1]);
        } else {
            // File messages store URL, not encrypted text
            message.setContent(request.getContent());
            message.setFileUrl(request.getFileUrl());
            message.setFileName(request.getFileName());
            message.setFileSize(request.getFileSize());
            message.setFileMimeType(request.getFileMimeType());
        }

        message = messageRepository.save(message);

        // Update latest message in chat
        chat.setLatestMessage(message);
        chatRepository.save(chat);

        // Build DTO with decrypted content for broadcast
        String decrypted = message.getMessageType() == Message.MessageType.TEXT
                ? encryptionUtil.decrypt(message.getContent(), message.getIv())
                : message.getContent();

        MessageDto dto = new MessageDto(message, decrypted);

        // Broadcast to all chat members via WebSocket
        messagingTemplate.convertAndSend("/topic/chat/" + chat.getId(),
                new WebSocketMessage("NEW_MESSAGE", dto));

        return dto;
    }

    public List<MessageDto> getChatMessages(String email, String chatId) {
        User user = userService.getUserByEmail(email);
        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> new ResourceNotFoundException("Chat not found"));

        boolean isMember = chat.getUsers().stream().anyMatch(u -> u.getId().equals(user.getId()));
        if (!isMember) throw new UnauthorizedException("You are not a member of this chat");

        return messageRepository.findByChatOrderByCreatedAtAsc(chat).stream()
                .map(m -> {
                    try {
                        String content = m.getMessageType() == Message.MessageType.TEXT
                                ? encryptionUtil.decrypt(m.getContent(), m.getIv())
                                : m.getContent();
                        return new MessageDto(m, content);
                    } catch (Exception e) {
                        return new MessageDto(m, "[encrypted message]");
                    }
                })
                .collect(Collectors.toList());
    }

    public void markMessagesAsRead(String email, String chatId) {
        User user = userService.getUserByEmail(email);
        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> new ResourceNotFoundException("Chat not found"));

        List<Message> messages = messageRepository.findByChatOrderByCreatedAtAsc(chat);
        messages.forEach(m -> {
            if (m.getReadBy().stream().noneMatch(u -> u.getId().equals(user.getId()))) {
                m.getReadBy().add(user);
            }
        });
        messageRepository.saveAll(messages);

        messagingTemplate.convertAndSend("/topic/chat/" + chatId,
                new WebSocketMessage("MESSAGES_READ", java.util.Map.of("userId", user.getId(), "chatId", chatId)));
    }

    public void clearChatHistory(String email, String chatId) {
        User user = userService.getUserByEmail(email);
        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> new ResourceNotFoundException("Chat not found"));

        boolean isMember = chat.getUsers().stream().anyMatch(u -> u.getId().equals(user.getId()));
        if (!isMember) throw new UnauthorizedException("Not a member of this chat");

        messageRepository.deleteByChatId(chatId);
        chat.setLatestMessage(null);
        chatRepository.save(chat);
    }

    public void deleteMessage(String email, String messageId) throws Exception {
        User user = userService.getUserByEmail(email);
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new ResourceNotFoundException("Message not found"));

        if (!message.getSender().getId().equals(user.getId())) {
            throw new UnauthorizedException("You can only delete your own messages");
        }

        message.setDeleted(true);
        message.setContent(encryptionUtil.encrypt("This message was deleted")[0]);
        messageRepository.save(message);

        messagingTemplate.convertAndSend("/topic/chat/" + message.getChat().getId(),
                new WebSocketMessage("MESSAGE_DELETED", java.util.Map.of("messageId", messageId)));
    }
}
