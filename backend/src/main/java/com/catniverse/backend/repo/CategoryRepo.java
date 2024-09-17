package com.catniverse.backend.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import com.catniverse.backend.model.Category;

public interface CategoryRepo extends JpaRepository<Category, Long> {
    Category findByName(String name);

    boolean existsByName(String name);
}
