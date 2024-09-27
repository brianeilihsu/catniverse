package com.catniverse.backend.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class OrderItemDto {
    private Long productId;
    private String productName;
    private String productBrand;
    private String downloadUrl;
    private int quantity;
    private BigDecimal price;
}
