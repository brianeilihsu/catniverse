package com.catniverse.backend.request;

import com.catniverse.backend.model.Category;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class UpdateProductRequest {
    private Long id;
    private String name;
    private String brand;
    private BigDecimal price;
    private int inventory; //inventory 存貨 quantity是customer選擇的數量
    private String description;

    private Category category;
}
