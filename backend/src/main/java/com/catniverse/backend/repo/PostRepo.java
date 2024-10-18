package com.catniverse.backend.repo;

import com.catniverse.backend.model.Post;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PostRepo extends JpaRepository<Post, Long> {
    List<Post> findPostsByUserId(Long userId);

    List<Post> findByTitleContainingIgnoreCase(String title);

    List<Post> findByCity(String city);
}
