package com.catniverse.backend.service.Product;

import com.catniverse.backend.exceptions.ProductNotFoundException;
import com.catniverse.backend.model.Category;
import com.catniverse.backend.model.Product;
import com.catniverse.backend.repo.CategoryRepo;
import com.catniverse.backend.repo.ProductRepo;
import com.catniverse.backend.request.AddProductRequest;
import com.catniverse.backend.request.UpdateProductRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor //everytime u use this annotation make sure ur repo is private final and no autowired
public class ProductService implements ImpProductService {
    @Autowired
    private ProductRepo productRepo;
    private CategoryRepo categoryRepo;

    @Override
    public Product addProduct(AddProductRequest request) {
        // check i the category is found in the DB
        // if yes, set it as the new product category
        // if no, then save it as a new category
        //then set as the new product category.
        Category category = Optional.ofNullable(categoryRepo.findByName(request.getCategory().getName()))
                .orElseGet(() -> {
                    Category newCategory = new Category(request.getCategory().getName());
                    return categoryRepo.save(newCategory);
                });
        request.setCategory(category);
        return productRepo.save(createProduct(request, category));
    }
    // ↑↑↑↑↑↑↑↑↑↑
    private Product createProduct(AddProductRequest request, Category category) {
        return new Product(
                request.getName(),
                request.getBrand(),
                request.getPrice(),
                request.getInventory(),
                request.getDescription(),
                category
        );
    }

    @Override
    public Product getProductById(Long id) {
        return productRepo.findById(id)
                .orElseThrow(
                        () -> new ProductNotFoundException("Product not found"));
    }

    @Override
    public void deleteProductById(Long id) {
        productRepo.findById(id)
                .ifPresentOrElse(productRepo::delete,
                        () -> {throw new ProductNotFoundException("Product not found");});
    }

    @Override
    public Product updateProductById(UpdateProductRequest request, Long productId) {
        return productRepo.findById(productId)
                .map(existingProduct -> updateExistingProduct(existingProduct, request))
                .map(productRepo :: save)
                .orElseThrow(() -> new ProductNotFoundException("Product not found"));
    }
    // ↑↑↑↑↑↑↑↑↑↑
    private Product updateExistingProduct(Product existingProduct, UpdateProductRequest request) {
        existingProduct.setName(request.getName());
        existingProduct.setBrand(request.getBrand());
        existingProduct.setPrice(request.getPrice());
        existingProduct.setInventory(request.getInventory());
        existingProduct.setDescription(request.getDescription());

        Category category = categoryRepo.findByName(request.getCategory().getName());
        existingProduct.setCategory(category);
        return existingProduct;
    }

    @Override
    public List<Product> getAllProducts() {
        return productRepo.findAll();
    }

    @Override
    public List<Product> getProductsByCategory(String category) {
        return productRepo.findByCategoryName(category);
    }

    @Override
    public List<Product> getProductsByBrand(String brand) {
        return productRepo.findByBrand(brand);
    }

    @Override
    public List<Product> getProductsByCategoryAndBrand(String category, String brand) {
        return productRepo.findByCategoryNameAndBrand(category, brand);
    }

    @Override
    public List<Product> getProductsByName(String name) {
        return productRepo.findByName(name);
    }

    @Override
    public List<Product> getProductsByBrandAndName(String brand, String name) {
        return productRepo.findByBrandAndName(brand, name);
    }

    @Override
    public Long countProductsByBrandAndName(String brand, String name) {
        return productRepo.countByBrandAndName(brand, name);
    }
}
