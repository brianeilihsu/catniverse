package com.catniverse.backend.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class CartItemDto {
    private int quantity;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
    private ProductDto product;
}
