package com.catniverse.backend.dto;

import lombok.Data;

import java.util.List;

@Data
public class UserDto {
    private Long userId;
    private String userName;
    private String email;
    private UserAvatarDto userAvatar;
    private List<OrderDto> orders;
    private List<PostDto> posts;
    private CartDto cart;
}
