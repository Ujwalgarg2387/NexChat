package com.nexchat.service;

import com.nexchat.dto.UserDto;
import com.nexchat.exception.ResourceNotFoundException;
import com.nexchat.model.User;
import com.nexchat.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public UserDto getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return new UserDto(user);
    }

    public List<UserDto> searchUsers(String keyword, String currentEmail) {
        return userRepository.searchUsers(keyword).stream()
                .filter(u -> !u.getEmail().equals(currentEmail))
                .map(UserDto::new)
                .collect(Collectors.toList());
    }

    public UserDto updateProfile(String email, String username, String about) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (username != null && !username.isBlank()) user.setUsername(username);
        if (about != null) user.setAbout(about);
        return new UserDto(userRepository.save(user));
    }

    public UserDto updateProfilePicture(String email, String pictureUrl) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setProfilePicture(pictureUrl);
        return new UserDto(userRepository.save(user));
    }

    public void setUserOnline(String email) {
        userRepository.findByEmail(email).ifPresent(user -> {
            user.setStatus(User.UserStatus.ONLINE);
            userRepository.save(user);
        });
    }

    public void setUserOffline(String email) {
        userRepository.findByEmail(email).ifPresent(user -> {
            user.setStatus(User.UserStatus.OFFLINE);
            user.setLastSeen(java.time.Instant.now());
            userRepository.save(user);
        });
    }

    public User getUserById(String userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
    }
}
