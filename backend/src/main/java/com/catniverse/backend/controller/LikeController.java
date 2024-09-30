package com.catniverse.backend.controller;


import com.catniverse.backend.exceptions.AlreadyExistsException;
import com.catniverse.backend.exceptions.ResourceNotFoundException;
import com.catniverse.backend.response.ApiResponse;
import com.catniverse.backend.service.like.ImpLikeService;
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

    @PostMapping("/add-like")
    public ResponseEntity<ApiResponse> addLike(@RequestParam Long userId, @RequestParam Long postId) {
        try {
            likeService.addLike(userId, postId);
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

    @DeleteMapping("/remove-like")
    public ResponseEntity<ApiResponse> removeLike(@RequestParam Long userId, @RequestParam Long postId) {
        try {
            likeService.removeLike(userId, postId);
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
