package com.catniverse.backend.service;

import com.catniverse.backend.model.Post;
import com.catniverse.backend.repo.PostRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PostService {

    @Autowired
    private PostRepo repo;

    public Post findPostById(long id) {
        return repo.findById(id).orElse(null);
    }

    public void save(Post post) {
        repo.save(post);
    }
}
