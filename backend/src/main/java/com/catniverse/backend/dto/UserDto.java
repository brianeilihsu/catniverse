package com.catniverse.backend.dto;

import com.catniverse.backend.model.Role;
import lombok.Data;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;

@Data
public class UserDto {
    private Long id;
    private String username;
    private String email;
    private String bio;
    private LocalDate joinDate;
    private UserAvatarDto userAvatar;
    private List<OrderDto> orders;
    private List<PostDto> posts;
    private Collection<RoleDto> roles;
    private CartDto cart;
}
