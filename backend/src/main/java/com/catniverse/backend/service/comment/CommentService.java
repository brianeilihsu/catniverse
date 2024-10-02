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
import com.catniverse.backend.request.addCommentRequest;
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
    private final UserRepo userRepo;
    private final ModelMapper modelMapper;

    @Override
    public List<CommentDto> getCommentsByPostId(Long postId) {
        List<Comment> comments = commentRepo.findByPostId(postId);
        return convertCommentListToDto(comments);
    }

    @Override
    public Comment addComment(addCommentRequest commentRequest) {
        if(commentRequest.getContent().contains("許皓翔"))
            throw new SpecitficNameException("請不要使用帥哥的名字，你這個傻逼");
        Comment comment = new Comment();
        User user = userRepo.findById(commentRequest.getUserId()).orElseThrow(() -> new ResourceNotFoundException("User Not Found with Id: " + commentRequest.getUserId()));
        Post post = postRepo.findById(commentRequest.getPostId()).orElseThrow(() -> new ResourceNotFoundException("Post Not Found with Id: " + commentRequest.getPostId()));
        comment.setUser(user);
        comment.setPost(post);
        comment.setContent(commentRequest.getContent());
        comment.setCreatedAt(LocalDateTime.now());
        commentRepo.save(comment);
        return comment;
    }

    @Override
    public void deleteCommentById(Long commentId) {
        commentRepo.findById(commentId).ifPresentOrElse(commentRepo::delete,
                ()-> {throw new ResourceNotFoundException("Comment Not Found with Id: " + commentId);});
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
