package com.catniverse.backend.request;

import com.catniverse.backend.model.User;
import lombok.Data;

@Data
public class AddPostRequest {
    private String title;
    private String content;
    private User user;
    private String address;
}
