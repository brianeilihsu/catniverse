package com.catniverse.backend.service.image;

import com.catniverse.backend.dto.ImageDto;
import com.catniverse.backend.model.Image;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ImpImageService {
    Image getImageById(Long id);
    void deleteImageById(Long id);
    List<ImageDto> saveImages(Long productId, List<MultipartFile> files);
    void updateImage(MultipartFile file, Long imageId);
}
