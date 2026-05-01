package com.nexchat.repository;

import com.nexchat.model.Message;
import com.nexchat.model.Chat;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface MessageRepository extends MongoRepository<Message, String> {
    List<Message> findByChatOrderByCreatedAtAsc(Chat chat);
    void deleteByChatId(String chatId);
    long countByChatId(String chatId);
}
