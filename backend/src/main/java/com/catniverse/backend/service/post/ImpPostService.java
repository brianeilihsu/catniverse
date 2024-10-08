package com.catniverse.backend.service.post;

import com.catniverse.backend.dto.PostDto;
import com.catniverse.backend.model.Post;
import com.catniverse.backend.request.AddPostRequest;

import java.util.List;

public interface ImpPostService {
    Post addPost(AddPostRequest addPostRequest);
    Post getPostById(Long id);
    void deletePostById(Long id);

    List<Post> getAllPosts();
    List<Post> getPostsByUserId(Long userId);

    List<Post> getPostsByTitle(String title);

    List<PostDto> getConvertedPosts(List<Post> posts);
    PostDto convertToDto(Post post);

    List<Post> findByAddress(String address);
}
