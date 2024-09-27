package com.catniverse.backend.dto;

import lombok.Data;

import java.util.List;

@Data
public class UserDto {
    private Long id;
    private String username;
    private String email;
    private UserAvatarDto userAvatar;
    private List<OrderDto> orders;
    private List<PostDto> posts;
    private CartDto cart;
}
