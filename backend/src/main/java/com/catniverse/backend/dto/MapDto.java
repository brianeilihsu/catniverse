package com.catniverse.backend.dto;

import lombok.Data;

@Data
public class MapDto {
    private Long postId;
    private boolean tipped;
    private double latitude;
    private double longitude;
    private String downloadUrl;
}
