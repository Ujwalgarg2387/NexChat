package com.nexchat.service;

import com.nexchat.dto.ChatDto;
import com.nexchat.dto.CreateGroupRequest;
import com.nexchat.dto.MessageDto;
import com.nexchat.exception.BadRequestException;
import com.nexchat.exception.ResourceNotFoundException;
import com.nexchat.exception.UnauthorizedException;
import com.nexchat.model.Chat;
import com.nexchat.model.Message;
import com.nexchat.model.User;
import com.nexchat.repository.ChatRepository;
import com.nexchat.repository.MessageRepository;
import com.nexchat.util.EncryptionUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import org.bson.types.ObjectId;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatRepository chatRepository;
    private final MessageRepository messageRepository;
    private final UserService userService;
    private final EncryptionUtil encryptionUtil;

    public ChatDto accessOrCreateOneOnOne(String currentEmail, String targetUserId) {
        User currentUser = userService.getUserByEmail(currentEmail);
        User targetUser = userService.getUserById(targetUserId);

        Optional<Chat> existing = chatRepository.findOneOnOneChat(
                new ObjectId(currentUser.getId()),
                new ObjectId(targetUser.getId())
        );
        if (existing.isPresent()) {
            return toChatDto(existing.get());
        }

        Chat chat = new Chat();
        chat.setGroupChat(false);
        chat.setChatName("one-on-one");
        chat.setUsers(List.of(currentUser, targetUser));
        return toChatDto(chatRepository.save(chat));
    }

    public List<ChatDto> getUserChats(String email) {
        User user = userService.getUserByEmail(email);
        return chatRepository.findAllChatsForUser(new ObjectId(user.getId())).stream()
                .map(this::toChatDto)
                .collect(Collectors.toList());
    }

    public ChatDto createGroup(String adminEmail, CreateGroupRequest request) {
        User admin = userService.getUserByEmail(adminEmail);

        List<User> members = new ArrayList<>();
        members.add(admin);
        for (String userId : request.getUserIds()) {
            members.add(userService.getUserById(userId));
        }

        Chat chat = new Chat();
        chat.setGroupChat(true);
        chat.setChatName(request.getChatName());
        chat.setGroupDescription(request.getGroupDescription());
        chat.setGroupAdmin(admin);
        chat.setUsers(members);
        chat.getAdmins().add(admin.getId());
        if (request.getGroupPicture() != null) {
            chat.setGroupPicture(request.getGroupPicture());
        }
        return toChatDto(chatRepository.save(chat));
    }

    public ChatDto addToGroup(String adminEmail, String chatId, String userId) {
        Chat chat = getChat(chatId);
        User admin = userService.getUserByEmail(adminEmail);
        if (!chat.getAdmins().contains(admin.getId())) {
            throw new UnauthorizedException("Only admins can add members");
        }
        User newMember = userService.getUserById(userId);
        if (chat.getUsers().stream().anyMatch(u -> u.getId().equals(userId))) {
            throw new BadRequestException("User is already in this group");
        }
        chat.getUsers().add(newMember);
        return toChatDto(chatRepository.save(chat));
    }

    public ChatDto removeFromGroup(String adminEmail, String chatId, String userId) {
        Chat chat = getChat(chatId);
        User admin = userService.getUserByEmail(adminEmail);
        if (!chat.getAdmins().contains(admin.getId()) && !admin.getId().equals(userId)) {
            throw new UnauthorizedException("Not authorized to remove this member");
        }
        chat.setUsers(chat.getUsers().stream()
                .filter(u -> !u.getId().equals(userId))
                .collect(Collectors.toList()));
        return toChatDto(chatRepository.save(chat));
    }

    public ChatDto renameGroup(String adminEmail, String chatId, String newName) {
        Chat chat = getChat(chatId);
        User admin = userService.getUserByEmail(adminEmail);
        if (!chat.getAdmins().contains(admin.getId())) {
            throw new UnauthorizedException("Only admins can rename the group");
        }
        chat.setChatName(newName);
        return toChatDto(chatRepository.save(chat));
    }

    public void deleteChat(String email, String chatId) {
        Chat chat = getChat(chatId);
        User user = userService.getUserByEmail(email);
        if (chat.isGroupChat() && !chat.getGroupAdmin().getId().equals(user.getId())) {
            throw new UnauthorizedException("Only group admin can delete the group");
        }
        messageRepository.deleteByChatId(chatId);
        chatRepository.delete(chat);
    }

    public Chat getChat(String chatId) {
        return chatRepository.findById(chatId)
                .orElseThrow(() -> new ResourceNotFoundException("Chat not found: " + chatId));
    }

    private ChatDto toChatDto(Chat chat) {
        MessageDto latestMessageDto = null;
        if (chat.getLatestMessage() != null) {
            Message lm = chat.getLatestMessage();
            try {
                String decrypted = lm.getMessageType() == Message.MessageType.TEXT
                        ? encryptionUtil.decrypt(lm.getContent(), lm.getIv())
                        : lm.getContent();
                latestMessageDto = new MessageDto(lm, decrypted);
            } catch (Exception e) {
                latestMessageDto = new MessageDto(lm, "[encrypted]");
            }
        }
        return new ChatDto(chat, latestMessageDto);
    }
}
