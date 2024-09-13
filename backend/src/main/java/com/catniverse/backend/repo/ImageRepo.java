package com.catniverse.backend.repo;

import com.catniverse.backend.model.Image;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ImageRepo extends JpaRepository<Image, Long> {
}
