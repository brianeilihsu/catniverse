package com.catniverse.backend.service.comment;

import com.catniverse.backend.dto.CommentDto;
import com.catniverse.backend.exceptions.ResourceNotFoundException;
import com.catniverse.backend.exceptions.SpecitficNameException;
import com.catniverse.backend.model.Comment;
import com.catniverse.backend.model.Post;
import com.catniverse.backend.model.User;
import com.catniverse.backend.repo.CommentRepo;
import com.catniverse.backend.repo.PostRepo;
import com.catniverse.backend.repo.UserRepo;
import com.catniverse.backend.service.forbidden.ImpForbiddenService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CommentService implements ImpCommentService{
    private final PostRepo postRepo;
    private final CommentRepo commentRepo;
    private final ImpForbiddenService forbiddenService;
    private final UserRepo userRepo;
    private final ModelMapper modelMapper;

    @Override
    public List<CommentDto> getCommentsByPostId(Long postId) {
        List<Comment> comments = commentRepo.findByPostId(postId);
        return convertCommentListToDto(comments);
    }

    @Override
    public Comment addComment(Long userId, Long postId, String content) {
        if(forbiddenService.check(content))
            throw new SpecitficNameException("請不要使用帥哥的名字，你這個傻逼");

        Comment comment = new Comment();
        User user = userRepo.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User Not Found with Id: " + userId));
        Post post = postRepo.findById(postId).orElseThrow(() -> new ResourceNotFoundException("Post Not Found with Id: " + postId));
        comment.setUser(user);
        comment.setPost(post);
        comment.setContent(content);
        comment.setCreatedAt(LocalDateTime.now());
        commentRepo.save(comment);
        return comment;
    }

    @Override
    public void deleteCommentById(Long userId,Long commentId){
        Comment comment = commentRepo.findById(commentId).orElseThrow(() -> new ResourceNotFoundException("Comment Not Found with Id: " + commentId));
        if(comment.getUser().getId().equals(userId)){
            commentRepo.delete(comment);
        }
        else
            throw new RuntimeException("Unauthorized to delete comment");

    }

    @Override
    public CommentDto convertCommentToDto(Comment comment) {
        User user = userRepo.findById(comment.getUser().getId()).orElseThrow(() -> new ResourceNotFoundException("User Not Found"));
        CommentDto commentDto = modelMapper.map(comment, CommentDto.class);
        commentDto.setUserId(user.getId());
        return commentDto;
    }

    @Override
    public List<CommentDto> convertCommentListToDto(List<Comment> commentList) {
        return commentList.stream().map(this::convertCommentToDto).toList();
    }
}
