package com.catniverse.backend.repo;

import com.catniverse.backend.model.Image;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ImageRepo extends JpaRepository<Image, Long> {

    List<Image> findByProductId(Long productId);
}
