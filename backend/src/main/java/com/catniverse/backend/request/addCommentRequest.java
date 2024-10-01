package com.catniverse.backend.request;

import lombok.Data;

@Data
public class addCommentRequest {
    private Long postId;
    private Long userId;
    private String content;
}
