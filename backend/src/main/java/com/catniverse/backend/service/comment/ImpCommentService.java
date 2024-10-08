package com.catniverse.backend.service.comment;

import com.catniverse.backend.dto.CommentDto;
import com.catniverse.backend.model.Comment;

import java.util.List;

public interface ImpCommentService {
    List<CommentDto> getCommentsByPostId(Long postId);

    Comment addComment(Long userId, Long postId, String content);

    void deleteCommentById(Long userId, Long commentId) throws IllegalAccessException;
    CommentDto convertCommentToDto(Comment comment);
    List<CommentDto> convertCommentListToDto(List<Comment> commentList);
}
