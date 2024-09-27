package com.catniverse.backend.repo;

import com.catniverse.backend.model.ProductImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ImageRepo extends JpaRepository<ProductImage, Long> {

    List<ProductImage> findByProductId(Long productId);
}
