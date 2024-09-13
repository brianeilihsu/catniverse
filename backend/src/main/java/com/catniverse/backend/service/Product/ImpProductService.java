package com.catniverse.backend.service.Product;

import com.catniverse.backend.model.Product;
import com.catniverse.backend.request.AddProductRequest;
import com.catniverse.backend.request.UpdateProductRequest;

import java.util.List;

public interface ImpProductService {
    Product addProduct(AddProductRequest product);
    Product getProductById(Long id);
    void deleteProductById(Long id);
    Product updateProductById(UpdateProductRequest product, Long id);

    List<Product> getAllProducts();
    List<Product> getProductsByCategory(String category);
    List<Product> getProductsByBrand(String brand);
    List<Product> getProductsByCategoryAndBrand(String category, String brand);
    List<Product> getProductsByName(String name);
    List<Product> getProductsByBrandAndName(String brand, String name);
    Long countProductsByBrandAndName(String brand, String name);
}
