package com.catniverse.backend.service.Image;

import com.catniverse.backend.dto.ImageDto;
import com.catniverse.backend.model.Image;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ImpImageService {
    Image getImageById(Long id);
    void deleteImageById(Long id);
    List<ImageDto> saveImages(List<MultipartFile> files, Long productId);
    void updateImage(MultipartFile file, Long imageId);
}
