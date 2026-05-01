package com.nexchat.controller;

import com.nexchat.dto.UserDto;
import com.nexchat.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserDto> getMe(@AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(userService.getCurrentUser(ud.getUsername()));
    }

    @GetMapping("/search")
    public ResponseEntity<List<UserDto>> search(
            @RequestParam String keyword,
            @AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(userService.searchUsers(keyword, ud.getUsername()));
    }

    @PutMapping("/profile")
    public ResponseEntity<UserDto> updateProfile(
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(userService.updateProfile(
                ud.getUsername(), body.get("username"), body.get("about")));
    }

    @PutMapping("/profile/picture")
    public ResponseEntity<UserDto> updatePicture(
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(userService.updateProfilePicture(ud.getUsername(), body.get("profilePicture")));
    }
}
