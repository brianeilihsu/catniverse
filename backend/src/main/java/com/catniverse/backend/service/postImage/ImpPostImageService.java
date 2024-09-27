package com.catniverse.backend.service.postImage;

import com.catniverse.backend.dto.PostImageDto;
import com.catniverse.backend.model.PostImage;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ImpPostImageService {
    PostImage getPostImageById(Long id);
    void deletePostImageById(Long id);
    List<PostImageDto> savePostImages(Long postId, List<MultipartFile> files);
    void updatePostImage(MultipartFile file, Long postImageId);
}
