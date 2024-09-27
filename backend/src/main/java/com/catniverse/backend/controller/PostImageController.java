package com.catniverse.backend.controller;

import com.catniverse.backend.dto.PostImageDto;
import com.catniverse.backend.exceptions.ResourceNotFoundException;
import com.catniverse.backend.model.PostImage;
import com.catniverse.backend.response.ApiResponse;
import com.catniverse.backend.service.postImage.ImpPostImageService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.sql.SQLException;
import java.util.List;

import static org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@CrossOrigin
@RequiredArgsConstructor
@RestController
@RequestMapping("${api.prefix}/post-images")
public class PostImageController {
    private final ImpPostImageService postImageService;

    @PostMapping("/upload")
    public ResponseEntity<ApiResponse> uploadImage(@RequestParam List<MultipartFile> files, @RequestParam Long postId) {
        try {
            List<PostImageDto> postImageDtos = postImageService.savePostImages(postId, files);
            return ResponseEntity.ok(new ApiResponse("Upload post image success!", postImageDtos));
        } catch (Exception e) {
            return ResponseEntity.status(INTERNAL_SERVER_ERROR).body(new ApiResponse("Upload image failed!", e.getMessage()));
        }
    }

    @Transactional
    @GetMapping("/post-image/download/{postImageId}")
    public ResponseEntity<Resource> downloadImage(@PathVariable Long postImageId) throws SQLException {
        PostImage postImage = postImageService.getPostImageById(postImageId);
        ByteArrayResource resource = new ByteArrayResource(postImage.getImage().getBytes(1, (int) postImage.getImage().length()));
        return  ResponseEntity.ok().contentType(MediaType.parseMediaType(postImage.getFileType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + postImage.getFileName() + "\"")
                .body(resource);
    }

    @PutMapping("/post-image/{postImageId}/update")
    public ResponseEntity<ApiResponse> updateImage(@PathVariable Long postImageId,
                                                   @RequestBody MultipartFile file){
        try {
            PostImage postImage = postImageService.getPostImageById(postImageId);
            if(postImage != null){
                postImageService.updatePostImage(file, postImageId);
                return ResponseEntity.ok(new ApiResponse("Update success", null));
            }
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(NOT_FOUND).body(new ApiResponse(e.getMessage(), null));
        }
        return ResponseEntity.status(INTERNAL_SERVER_ERROR).body(new ApiResponse("Update failed", INTERNAL_SERVER_ERROR));
    }

    @DeleteMapping("/post-image/{postImageId}/delete")
    public ResponseEntity<ApiResponse> deleteImage(@PathVariable Long postImageId){
        try {
            PostImage postImage = postImageService.getPostImageById(postImageId);
            if(postImage != null){
                postImageService.deletePostImageById(postImageId);
                return ResponseEntity.ok(new ApiResponse("Delete success", null));
            }
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(NOT_FOUND).body(new ApiResponse(e.getMessage(), null));
        }
        return ResponseEntity.status(INTERNAL_SERVER_ERROR).body(new ApiResponse("Delete failed", INTERNAL_SERVER_ERROR));
    }



}
