package com.catniverse.backend.request;

import com.catniverse.backend.model.User;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AddPostRequest {
    private String title;
    private String content;
    private String address;
    private User user;
    private LocalDateTime createdAt;
}
