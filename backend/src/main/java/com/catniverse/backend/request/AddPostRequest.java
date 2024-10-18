package com.catniverse.backend.request;

import com.catniverse.backend.model.User;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class AddPostRequest {
    private String title;
    private String content;
    private String city;
    private String district;
    private String street;

    private double latitude;
    private double longitude;
    private boolean tipped;//剪耳
    private boolean stray;//流浪
    private User user;
    private LocalDateTime createdAt;
}
