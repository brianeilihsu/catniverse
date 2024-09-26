package com.catniverse.backend.dto;

import com.catniverse.backend.model.User;
import lombok.Data;

import java.util.List;

@Data
public class PostDto {
    private Long id;
    private String title;
    private String content;
    private User user;
    private List<PostImageDto> postImages;
}
