package com.catniverse.backend.controller;

import com.catniverse.backend.dto.PostDto;
import com.catniverse.backend.exceptions.ResourceNotFoundException;
import com.catniverse.backend.exceptions.SpecitficNameException;
import com.catniverse.backend.model.Post;
import com.catniverse.backend.model.User;
import com.catniverse.backend.request.AddPostRequest;
import com.catniverse.backend.response.ApiResponse;
import com.catniverse.backend.service.post.ImpPostService;
import com.catniverse.backend.service.user.ImpUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

import static org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@CrossOrigin
@RequiredArgsConstructor
@RestController
@RequestMapping("${api.prefix}/posts")
public class PostController {
    private final ImpPostService postService;
    private final ImpUserService userService;
    @GetMapping("/popular")
    public ResponseEntity<ApiResponse> getPopularPosts() {
        List<Post> posts = postService.getAllPosts();
        List<PostDto> convertedPosts = postService.getConvertedPosts(posts)
                .stream()
                .sorted((p1, p2) -> Integer.compare(p2.getTotal_likes()+ p2.getTotal_comments()
                                                    , p1.getTotal_likes()+ p1.getTotal_comments()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(new ApiResponse("success", convertedPosts));
    }

    @GetMapping("/latest")
    public ResponseEntity<ApiResponse> getLatestPosts() {
        List<Post> posts = postService.getAllPosts();
        List<PostDto> convertedPosts = postService.getConvertedPosts(posts)
                .stream()
                .sorted((p1, p2) -> p2.getCreatedAt().compareTo(p1.getCreatedAt()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(new ApiResponse("success", convertedPosts));
    }

    @GetMapping("/region")
    public ResponseEntity<ApiResponse> getRegionPosts(@RequestParam String address) {
        List<Post> posts = postService.findByAddress(address);
        List<PostDto> convertedPosts = postService.getConvertedPosts(posts);
        return ResponseEntity.ok(new ApiResponse("success", convertedPosts));
    }

    @GetMapping("/user-post/{userId}")
    public ResponseEntity<ApiResponse> getUserPosts(@PathVariable Long userId) {
        List<Post> posts = postService.getPostsByUserId(userId);
        List<PostDto> convertedPosts = postService.getConvertedPosts(posts);
        return ResponseEntity.ok(new ApiResponse("number of posts: " + convertedPosts.size(), convertedPosts));
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
        }catch (SpecitficNameException e){
            return ResponseEntity.status(409).body(new ApiResponse("陳妍不要搞", e.getMessage()));
        }
        catch (Exception e) {
            return ResponseEntity.status(INTERNAL_SERVER_ERROR).body(new ApiResponse(e.getMessage(), null));
        }

    }

    @DeleteMapping("delete/{postId}")
    public ResponseEntity<ApiResponse> deletePostById(@PathVariable Long postId){
        try{
            postService.deletePostById(postId);
            return ResponseEntity.ok(new ApiResponse("delete post success", null));
        }
        catch (ResourceNotFoundException e){
            return ResponseEntity.status(NOT_FOUND).body(new ApiResponse("Post not found with id:" + postId, e.getMessage()));
        }catch (Exception e) {
            return ResponseEntity.status(INTERNAL_SERVER_ERROR).body(new ApiResponse(e.getMessage(), null));
        }
    }
}
