package com.catniverse.backend.service.productImage;

import com.catniverse.backend.dto.ProductImageDto;
import com.catniverse.backend.exceptions.ResourceNotFoundException;
import com.catniverse.backend.model.ProductImage;
import com.catniverse.backend.model.Product;
import com.catniverse.backend.repo.ImageRepo;
import com.catniverse.backend.service.product.ImpProductService;
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
public class ProductImageService implements ImpProductImageService {
    private final ImageRepo imageRepo;
    private final ImpProductService productService;

    @Override
    public ProductImage getImageById(Long id) { //imageId not userId
        return imageRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("No image found with id: " + id));
    }

    @Override
    public void deleteImageById(Long id) {
        imageRepo.findById(id)
                .ifPresentOrElse(imageRepo::delete, () -> {
                    throw new ResourceNotFoundException("No image found with id: " + id);
                });
    }

    @Override
    public List<ProductImageDto> saveImages(Long productId, List<MultipartFile> files) {
        Product product = productService.getProductById(productId);

        List<ProductImageDto> savedProductImageDto = new ArrayList<>();
        for(MultipartFile file : files) {
            try {
                ProductImage productImage = new ProductImage();
                productImage.setFileName(file.getOriginalFilename());
                productImage.setFileType(file.getContentType());
                productImage.setImage(new SerialBlob(file.getBytes()));
                productImage.setProduct(product);

                String buildDownloadUrl = "/api/v1/product-images/image/download/";
                String downloadUrl = buildDownloadUrl + productImage.getId();
                productImage.setDownloadUrl(downloadUrl);
                ProductImage savedProductImage = imageRepo.save(productImage);

                savedProductImage.setDownloadUrl( buildDownloadUrl + savedProductImage.getId());
                imageRepo.save(savedProductImage);

                ProductImageDto productImageDto = new ProductImageDto();
                productImageDto.setId(savedProductImage.getId());
                productImageDto.setFileName(savedProductImage.getFileName());
                productImageDto.setDownloadUrl(savedProductImage.getDownloadUrl());
                savedProductImageDto.add(productImageDto);


            }catch (IOException | SQLException e) {
                throw new RuntimeException(e.getMessage());
            }
        }
        return savedProductImageDto;
    }

    @Override
    public void updateImage(MultipartFile file, Long imageId) {
        ProductImage productImage = getImageById(imageId);
        try {
            productImage.setFileName(file.getOriginalFilename());
            productImage.setFileType(file.getContentType());
            productImage.setImage(new SerialBlob(file.getBytes()));
            imageRepo.save(productImage);
        } catch (IOException | SQLException e) {
            throw new RuntimeException(e);
        }
    }
}
