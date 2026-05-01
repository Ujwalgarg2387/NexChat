package com.nexchat.dto;

import com.nexchat.model.User;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class UserDto {
    private String id;
    private String username;
    private String email;
    private String profilePicture;
    private String about;
    private User.UserStatus status;
    private String lastSeen;

    public UserDto(User user) {
        this.id = user.getId();
        this.username = user.getUsername();
        this.email = user.getEmail();
        this.profilePicture = user.getProfilePicture();
        this.about = user.getAbout();
        this.status = user.getStatus();
        this.lastSeen = user.getLastSeen() != null ? user.getLastSeen().toString() : null;
    }
}
