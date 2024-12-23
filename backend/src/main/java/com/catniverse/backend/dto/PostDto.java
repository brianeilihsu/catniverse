package com.catniverse.backend.dto;

import com.catniverse.backend.model.User;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class PostDto {
    private Long id;
    private String title;
    private String content;
    private String city;
    private String district;
    private String street;
    private boolean tipped;
    private boolean stray;
    private int total_likes; // 我要怎麼取得likes的總數?
    private int total_comments;
    private double latitude;
    private double longitude;

    @JsonIgnore
    private User user;

    private Long userId;

    private LocalDateTime createdAt;

    private List<PostImageDto> postImages;
}
