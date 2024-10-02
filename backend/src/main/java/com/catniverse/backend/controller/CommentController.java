package com.catniverse.backend.controller;

import com.catniverse.backend.dto.CommentDto;
import com.catniverse.backend.exceptions.ResourceNotFoundException;
import com.catniverse.backend.exceptions.SpecitficNameException;
import com.catniverse.backend.model.Comment;
import com.catniverse.backend.request.addCommentRequest;
import com.catniverse.backend.response.ApiResponse;
import com.catniverse.backend.service.comment.ImpCommentService;
import jdk.swing.interop.SwingInterOpUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin
@RequiredArgsConstructor
@RestController
@RequestMapping("${api.prefix}/comments")
public class CommentController {
    private final ImpCommentService commentService;

    @GetMapping("from-post/{postId}")
    public ResponseEntity<ApiResponse> getCommentsByPostId(@PathVariable Long postId) {
        List<CommentDto> comments = commentService.getCommentsByPostId(postId);

        if (comments.isEmpty()) {
            return ResponseEntity.ok().body(new ApiResponse("No Content", null));
        }
        else
            return ResponseEntity.ok().body(new ApiResponse("Success", comments));
    }

    @PostMapping("add")
    public ResponseEntity<ApiResponse> addComment(@RequestBody addCommentRequest commentRequest) {
        try {
            Comment comment = commentService.addComment(commentRequest);
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
            commentService.deleteCommentById(commentId);
            return ResponseEntity.ok().body(new ApiResponse("Delete Comment Success", null));
        }
        catch (ResourceNotFoundException e){
            return ResponseEntity.status(404).body(new ApiResponse(e.getMessage(), null));
        }
        catch (Exception e){
            return ResponseEntity.status(500).body(new ApiResponse(e.getMessage(), null));
        }
    }

}
