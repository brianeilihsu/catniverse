package com.catniverse.backend.service.post;

import com.catniverse.backend.dto.MapDto;
import com.catniverse.backend.dto.PostDto;
import com.catniverse.backend.model.Post;
import com.catniverse.backend.request.AddPostRequest;

import java.util.List;

public interface ImpPostService {
    Post addPost(AddPostRequest addPostRequest);
    Post getPostById(Long id);
    void deletePostById(Long id);

    List<Post> getAllPosts();

    List<PostDto> getPopularPosts(int page);

    List<Post> getPostsByUserId(Long userId);

    List<Post> getPostsByTitle(String title);

    List<PostDto> getConvertedPosts(List<Post> posts);
    PostDto convertToDto(Post post);

    List<Post> findByCity(String city);

    List<MapDto> getConvertedMaps(List<Post> posts);

    MapDto convertToMapDto(Post post);
}
