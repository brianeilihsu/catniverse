package com.catniverse.backend.service.comment;

import com.catniverse.backend.dto.CommentDto;
import com.catniverse.backend.model.Comment;
import com.catniverse.backend.request.addCommentRequest;

import java.util.List;

public interface ImpCommentService {
    List<CommentDto> getCommentsByPostId(Long postId);
    Comment addComment(addCommentRequest commentRequest);
    void deleteCommentById(Long commentId);
    CommentDto convertCommentToDto(Comment comment);
    List<CommentDto> convertCommentListToDto(List<Comment> commentList);
}
