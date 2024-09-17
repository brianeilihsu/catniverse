package com.catniverse.backend.service.Product;

import com.catniverse.backend.dto.ProductDto;
import com.catniverse.backend.model.Product;
import com.catniverse.backend.request.AddProductRequest;
import com.catniverse.backend.request.UpdateProductRequest;

import java.util.List;

public interface ImpProductService {
    Product addProduct(AddProductRequest product);
    Product getProductById(Long id);
    void deleteProductById(Long id);
    Product updateProduct(UpdateProductRequest product, Long productId);

    List<Product> getAllProducts();
    List<Product> getProductsByCategory(String category);
    List<Product> getProductsByBrand(String brand);
    List<Product> getProductsByCategoryAndBrand(String category, String brand);
    List<Product> getProductsByName(String name);
    List<Product> getProductsByBrandAndName(String brand, String name);
    Long countProductsByBrandAndName(String brand, String name);

    List<ProductDto> getConvertedProducts(List<Product> products);

    ProductDto convertToDto(Product product);
}
