package com.catniverse.backend.dto;

import lombok.Data;

import java.util.List;

@Data
public class UserDto {
    private Long userId;
    private String userName;
    private String email;
    private List<OrderDto> orders;
    private CartDto cart;
}