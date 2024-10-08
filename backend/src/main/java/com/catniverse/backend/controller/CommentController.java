package com.catniverse.backend.controller;

import com.catniverse.backend.dto.CommentDto;
import com.catniverse.backend.exceptions.ResourceNotFoundException;
import com.catniverse.backend.exceptions.SpecitficNameException;
import com.catniverse.backend.model.Comment;
import com.catniverse.backend.model.User;
import com.catniverse.backend.response.ApiResponse;
import com.catniverse.backend.service.comment.ImpCommentService;
import com.catniverse.backend.service.user.ImpUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.HttpClientErrorException;

import java.util.List;

import static org.ietf.jgss.GSSException.UNAUTHORIZED;

@CrossOrigin
@RequiredArgsConstructor
@RestController
@RequestMapping("${api.prefix}/comments")
public class CommentController {
    private final ImpCommentService commentService;
    private final ImpUserService userService;

    @GetMapping("from-post/{postId}")
    public ResponseEntity<ApiResponse> getCommentsByPostId(@PathVariable Long postId) {
        List<CommentDto> comments = commentService.getCommentsByPostId(postId);

        if (comments.isEmpty()) {
            return ResponseEntity.ok().body(new ApiResponse("No Content", null));
        }
        else
            return ResponseEntity.ok().body(new ApiResponse("Success", comments));
    }

    @PostMapping("/add/{postId}")
    public ResponseEntity<ApiResponse> addComment(@RequestParam String content, @PathVariable Long postId) {
        try {
            User user = userService.getAuthenticatedUser();
            Comment comment = commentService.addComment(user.getId(), postId, content);
            CommentDto commentDto = commentService.convertCommentToDto(comment);
            return ResponseEntity.ok().body(new ApiResponse("Add Comment Success", commentDto));
        }
        catch(SpecitficNameException e){
            return ResponseEntity.status(409).body(new ApiResponse("Specitfic Name Error", e.getMessage()));
        }
        catch (ResourceNotFoundException e){
            return ResponseEntity.status(404).body(new ApiResponse(e.getMessage(), null));
        }
        catch (Exception e){
            return ResponseEntity.status(500).body(new ApiResponse(e.getMessage(), null));
        }
    }

    @DeleteMapping("delete/{commentId}")
    public ResponseEntity<ApiResponse> deleteComment(@PathVariable Long commentId) {
        try {
            User user = userService.getAuthenticatedUser();
            commentService.deleteCommentById(user.getId(), commentId);
            return ResponseEntity.ok().body(new ApiResponse("Delete Comment Success", null));
        }
        catch (ResourceNotFoundException e){
            return ResponseEntity.status(404).body(new ApiResponse(e.getMessage(), null));
        }
        catch (Exception e){
            return ResponseEntity.status(UNAUTHORIZED).body(new ApiResponse(e.getMessage(), null));
        }
    }

}
