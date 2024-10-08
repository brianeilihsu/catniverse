package com.catniverse.backend.controller;


import com.catniverse.backend.exceptions.AlreadyExistsException;
import com.catniverse.backend.exceptions.ResourceNotFoundException;
import com.catniverse.backend.model.User;
import com.catniverse.backend.response.ApiResponse;
import com.catniverse.backend.service.like.ImpLikeService;
import com.catniverse.backend.service.user.ImpUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin
@RequiredArgsConstructor
@RestController
@RequestMapping("${api.prefix}/likes")
public class LikeController {
    private final ImpLikeService likeService;
    private final ImpUserService userService;

    @PostMapping("/add-like")
    public ResponseEntity<ApiResponse> addLike(@RequestParam Long postId) {
        try {
            User user = userService.getAuthenticatedUser();
            likeService.addLike(user.getId(), postId);
            return ResponseEntity.status(HttpStatus.CREATED).body(new ApiResponse("Like added successfully", null));
        }
        catch (AlreadyExistsException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(new ApiResponse(e.getMessage(), null));
        }
        catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ApiResponse(e.getMessage(), null));
        }
        catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ApiResponse(e.getMessage(), null));
        }
    }

    @GetMapping("/existed")
    public ResponseEntity<ApiResponse> isExisted(@RequestParam Long postId){
        try {
            User user = userService.getAuthenticatedUser();
            Long likeId = likeService.isExisted(user.getId(), postId);
            return ResponseEntity.ok().body(new ApiResponse("like existed with id: " + likeId, likeId));
        }
        catch (ResourceNotFoundException e){
            return ResponseEntity.status(404).body(new ApiResponse(e.getMessage(), null));
        }
    }

    @DeleteMapping("/remove-like")
    public ResponseEntity<ApiResponse> removeLike(@RequestParam Long postId) {
        try {
            User user = userService.getAuthenticatedUser();
            likeService.removeLike(user.getId(), postId);
            return ResponseEntity.status(HttpStatus.OK).body(new ApiResponse("Like removed successfully", null));
        }
        catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ApiResponse(e.getMessage(), null));
        }
        catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ApiResponse(e.getMessage(), null));
        }
    }
}
