package com.catniverse.backend.repo;

import com.catniverse.backend.model.PostImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PostImageRepo extends JpaRepository<PostImage, Long> {
    List<PostImage> findByPostId(Long id);

    PostImage getPostImageById(Long postImageId);
}
