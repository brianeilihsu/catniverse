package com.catniverse.backend.service.productImage;

import com.catniverse.backend.dto.ProductImageDto;
import com.catniverse.backend.model.ProductImage;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ImpProductImageService {
    ProductImage getImageById(Long id);
    void deleteImageById(Long id);
    List<ProductImageDto> saveImages(Long productId, List<MultipartFile> files);
    void updateImage(MultipartFile file, Long imageId);
}
