package com.catniverse.backend.controller;

import com.catniverse.backend.dto.PostDto;
import com.catniverse.backend.model.Post;
import com.catniverse.backend.model.User;
import com.catniverse.backend.request.AddPostRequest;
import com.catniverse.backend.response.ApiResponse;
import com.catniverse.backend.service.post.ImpPostService;
import com.catniverse.backend.service.user.ImpUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

import static org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR;

@CrossOrigin
@RequiredArgsConstructor
@RestController
@RequestMapping("${api.prefix}/posts")
public class PostController {
    private final ImpPostService postService;
    private final ImpUserService userService;
    @GetMapping("/all")
    public ResponseEntity<ApiResponse> getAllPosts() {
        List<Post> posts = postService.getAllPosts();
        List<PostDto> convertedPosts = postService.getConvertedPosts(posts);
        return ResponseEntity.ok(new ApiResponse("success", convertedPosts));
    }

    @GetMapping("/user-post/{userId}")
    public ResponseEntity<ApiResponse> getUserPosts(@PathVariable Long userId) {
        List<Post> posts = postService.getPostsByUserId(userId);
        List<PostDto> convertedPosts = postService.getConvertedPosts(posts);
        return ResponseEntity.ok(new ApiResponse("success", convertedPosts));
    }

    @PostMapping("/add/{userId}")
    public ResponseEntity<ApiResponse> addPost(@RequestBody AddPostRequest postRequest,
                                               @PathVariable Long userId) {
        try {
            User user = userService.getUserById(userId);
            postRequest.setUser(user);
            Post post = postService.addPost(postRequest);
            PostDto postDto = postService.convertToDto(post);
            return ResponseEntity.ok(new ApiResponse("add post success", postDto));
        } catch (Exception e) {
            return ResponseEntity.status(INTERNAL_SERVER_ERROR).body(new ApiResponse(e.getMessage(), null));
        }

    }
}
