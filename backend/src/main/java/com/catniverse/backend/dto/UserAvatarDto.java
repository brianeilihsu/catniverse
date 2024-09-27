package com.catniverse.backend.dto;

import lombok.Data;

@Data
public class UserAvatarDto {
    private Long id;
    private String fileName;
    private String downloadUrl;
}
