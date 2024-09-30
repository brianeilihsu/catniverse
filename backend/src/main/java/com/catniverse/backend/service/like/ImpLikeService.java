package com.catniverse.backend.service.like;

public interface ImpLikeService {
    void addLike(Long userId, Long postId);
    void removeLike(Long userId, Long postId);
}
