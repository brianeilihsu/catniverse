package com.catniverse.backend.service.like;

import com.catniverse.backend.exceptions.AlreadyExistsException;
import com.catniverse.backend.exceptions.ResourceNotFoundException;
import com.catniverse.backend.model.Like;
import com.catniverse.backend.model.Post;
import com.catniverse.backend.model.User;
import com.catniverse.backend.repo.LikeRepo;
import com.catniverse.backend.repo.PostRepo;
import com.catniverse.backend.repo.UserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class LikeService implements ImpLikeService{
    private final LikeRepo likeRepo;
    private final PostRepo postRepo;
    private final UserRepo userRepo;

    @Override
    public void addLike(Long userId, Long postId) {
        if (likeRepo.existsLikeByUserIdAndPostId(userId, postId)) {
            throw new AlreadyExistsException("Like already exists");
        }
        else {
            Like like = new Like();
            Post post = postRepo.findById(postId).orElseThrow(() -> new ResourceNotFoundException("Can not find post with id: " + postId));
            User user = userRepo.findById(userId).orElseThrow(() -> new ResourceNotFoundException("Can not find user with id: " + userId));
            like.setPost(post);
            like.setUser(user);
            likeRepo.save(like);
        }

    }

    @Override
    public void removeLike(Long userId, Long postId) {
        likeRepo.findByUserIdAndPostId(userId, postId)
                .ifPresentOrElse(likeRepo :: delete, () -> {throw new ResourceNotFoundException("like not found");});
    }
}
