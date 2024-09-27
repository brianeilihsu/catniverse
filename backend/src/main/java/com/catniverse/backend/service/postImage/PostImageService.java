package com.catniverse.backend.service.postImage;

import com.catniverse.backend.dto.PostImageDto;
import com.catniverse.backend.exceptions.ResourceNotFoundException;
import com.catniverse.backend.model.Post;
import com.catniverse.backend.model.PostImage;
import com.catniverse.backend.repo.PostImageRepo;
import com.catniverse.backend.service.post.ImpPostService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.sql.rowset.serial.SerialBlob;
import java.io.IOException;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PostImageService implements ImpPostImageService{
    private final PostImageRepo postImageRepo;
    private final ImpPostService postService;

    @Override
    public PostImage getPostImageById(Long id) {
        return postImageRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("No post image found with id: " + id));
    }

    @Override
    public void deletePostImageById(Long id) {
        postImageRepo.findById(id)
                .ifPresentOrElse(postImageRepo :: delete, () -> {
                    throw new ResourceNotFoundException("No post image found with id: " + id);
                });
    }

    @Override
    public List<PostImageDto> savePostImages(Long postId, List<MultipartFile> files) {
        Post post = postService.getPostById(postId);

        List<PostImageDto> savedPostImageDto = new ArrayList<>();
        for (MultipartFile file : files) {
            try {
                PostImage postImage = new PostImage();
                postImage.setFileName(file.getOriginalFilename());
                postImage.setFileType(file.getContentType());
                postImage.setImage(new SerialBlob(file.getBytes()));
                postImage.setPost(post);

                String buildDownloadUrl = "/api/v1/post-images/post-image/download/";
                String downloadUrl = buildDownloadUrl + postImage.getId();
                postImage.setDownloadUrl(downloadUrl);
                PostImage savedPostImage = postImageRepo.save(postImage);

                savedPostImage.setDownloadUrl(buildDownloadUrl + savedPostImage.getId());
                postImageRepo.save(savedPostImage);

                PostImageDto postImageDto = new PostImageDto();
                postImageDto.setId(savedPostImage.getId());
                postImageDto.setFileName(savedPostImage.getFileName());
                postImageDto.setDownloadUrl(savedPostImage.getDownloadUrl());
                savedPostImageDto.add(postImageDto);

            }catch (IOException | SQLException e) {
                throw new RuntimeException(e.getMessage());
            }
        }

        return savedPostImageDto;
    }

    @Override
    public void updatePostImage(MultipartFile file, Long postImageId) {
        PostImage postImage = getPostImageById(postImageId);
        try {
            postImage.setFileName(file.getOriginalFilename());
            postImage.setFileType(file.getContentType());
            postImage.setImage(new SerialBlob(file.getBytes()));
            postImageRepo.save(postImage);
        } catch (IOException | SQLException e) {
            throw new RuntimeException(e);
        }
    }
}
