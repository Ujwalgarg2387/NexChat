package com.nexchat.repository;

import com.nexchat.model.Chat;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import java.util.List;
import java.util.Optional;

public interface ChatRepository extends MongoRepository<Chat, String> {

    // Use users.$id to query against the ObjectId stored inside the @DBRef
    @Query("{ 'users.$id': ?0, 'isGroupChat': false }")
    List<Chat> findByUsersContaining(ObjectId userId);

    // $all on DBRef array requires matching via .$id
    @Query("{ 'users.$id': { $all: [?0, ?1] }, 'isGroupChat': false }")
    Optional<Chat> findOneOnOneChat(ObjectId userId1, ObjectId userId2);

    @Query("{ 'users.$id': ?0 }")
    List<Chat> findAllChatsForUser(ObjectId userId);
}
