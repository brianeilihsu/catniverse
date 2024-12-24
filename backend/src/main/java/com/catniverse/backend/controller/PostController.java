package com.catniverse.backend.controller;

import com.catniverse.backend.dto.PostDto;
import com.catniverse.backend.dto.PostImageDto;
import com.catniverse.backend.exceptions.ResourceNotFoundException;
import com.catniverse.backend.exceptions.SpecitficNameException;
import com.catniverse.backend.model.Post;
import com.catniverse.backend.model.User;
import com.catniverse.backend.request.AddPostRequest;
import com.catniverse.backend.response.ApiResponse;
import com.catniverse.backend.service.post.ImpPostService;
import com.catniverse.backend.service.postImage.ImpPostImageService;
import com.catniverse.backend.service.user.ImpUserService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

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
    private final ImpPostImageService postImageService;

//    @GetMapping("/popular")
//    public ResponseEntity<ApiResponse> getPopularPosts() {
//        try {
//            List<Post> posts = postService.getAllPosts();
//            List<PostDto> convertedPosts = postService.getConvertedPosts(posts)
//                    .stream()
//                    .sorted((p1, p2) -> Integer.compare(p2.getTotal_likes()+ p2.getTotal_comments()
//                                                        , p1.getTotal_likes()+ p1.getTotal_comments()))
//                    .collect(Collectors.toList());
//            return ResponseEntity.ok(new ApiResponse("success", convertedPosts));
//        } catch (Exception e) {
//            return ResponseEntity.status(500).body(new ApiResponse( e.getMessage(), null));
//        }
//    }

    @GetMapping("/popular")
    public ResponseEntity<ApiResponse> getPopularPosts(@RequestParam(defaultValue = "0") int page) {
        try {
            // 使用 Service 抓取分頁後的熱門貼文
            List<PostDto> popularPosts = postService.getPopularPosts(page);
            return ResponseEntity.ok(new ApiResponse("success", popularPosts));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new ApiResponse(e.getMessage(), null));
        }
    }


    @GetMapping("/latest")
    public ResponseEntity<ApiResponse> getLatestPosts() {
        try {
            List<Post> posts = postService.getAllPosts();
            List<PostDto> convertedPosts = postService.getConvertedPosts(posts)
                    .stream()
                    .sorted((p1, p2) -> p2.getCreatedAt().compareTo(p1.getCreatedAt()))
                    .collect(Collectors.toList());
            return ResponseEntity.ok(new ApiResponse("success", convertedPosts));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new ApiResponse( e.getMessage(), null));
        }
    }

    @GetMapping("/region")
    public ResponseEntity<ApiResponse> getRegionPosts(@RequestParam String city) {
        try {
            List<Post> posts = postService.findByCity(city);
            List<PostDto> convertedPosts = postService.getConvertedPosts(posts);
            return ResponseEntity.ok(new ApiResponse("success", convertedPosts));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new ApiResponse( e.getMessage(), null));
        }
    }

    @GetMapping("/title")
    public ResponseEntity<ApiResponse> getPostByTitle(@RequestParam String title) {
        try {
            List<Post> posts = postService.getPostsByTitle(title);
            List<PostDto> convertedPosts = postService.getConvertedPosts(posts);
            return ResponseEntity.ok(new ApiResponse("find by title successfully", convertedPosts));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new ApiResponse( e.getMessage(), null));
        }
    }

    @GetMapping("/user-post/{userId}")
    public ResponseEntity<ApiResponse> getUserPosts(@PathVariable Long userId) {
        try {
            List<Post> posts = postService.getPostsByUserId(userId);
            List<PostDto> convertedPosts = postService.getConvertedPosts(posts);
            return ResponseEntity.ok(new ApiResponse("number of posts: " + convertedPosts.size(), convertedPosts));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new ApiResponse( e.getMessage(), null));
        }
    }

    @GetMapping("/post-id/{postId}")
    public ResponseEntity<ApiResponse> getPostById(@PathVariable Long postId) {

        try {
            Post post = postService.getPostById(postId);
            PostDto postDto = postService.convertToDto(post);
            return ResponseEntity.ok(new ApiResponse("success", postDto));
        }
        catch (ResourceNotFoundException e){
            return ResponseEntity.status(NOT_FOUND).body(new ApiResponse(e.getMessage(), null ));
        }
        catch (Exception e) {
            return ResponseEntity.status(500).body(new ApiResponse(e.getMessage(), null ));
        }
    }

    @Transactional
    @PostMapping("/add")
    public ResponseEntity<ApiResponse> addPost(@ModelAttribute AddPostRequest postRequest,@RequestParam List<MultipartFile> files) {
        try {
            User user = userService.getAuthenticatedUser();
            postRequest.setUser(user);
            Post post = postService.addPost(postRequest);
            postImageService.savePostImages(post.getId(), files);
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
