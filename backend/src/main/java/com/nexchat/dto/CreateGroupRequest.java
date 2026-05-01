package com.nexchat.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.util.List;

@Data
public class CreateGroupRequest {
    @NotBlank(message = "Group name is required")
    @Size(min = 3, max = 50)
    private String chatName;
    private String groupDescription;
    private List<String> userIds;
    private String groupPicture;
}
