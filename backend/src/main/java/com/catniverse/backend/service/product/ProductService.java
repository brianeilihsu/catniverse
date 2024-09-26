package com.catniverse.backend.service.product;

import com.catniverse.backend.dto.ImageDto;
import com.catniverse.backend.dto.ProductDto;
import com.catniverse.backend.exceptions.ResourceNotFoundException;
import com.catniverse.backend.model.Category;
import com.catniverse.backend.model.Image;
import com.catniverse.backend.model.Product;
import com.catniverse.backend.repo.CategoryRepo;
import com.catniverse.backend.repo.ImageRepo;
import com.catniverse.backend.repo.ProductRepo;
import com.catniverse.backend.request.AddProductRequest;
import com.catniverse.backend.request.UpdateProductRequest;

import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;


import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor //everytime u use this annotation make sure ur repo is private final and no autowired
public class ProductService implements ImpProductService {
    private final ProductRepo productRepo;
    private final CategoryRepo categoryRepo;

    private final ModelMapper modelMapper;
    private final ImageRepo imageRepo;


    @Override
    public Product addProduct(AddProductRequest request) {
        // check i the category is found in the DB
        // if yes, set it as the new product category
        // if no, then save it as a new category
        //then set as the new product category.

//        if(productExists(request.getName(), request.getBrand())){
//            throw new AlreadyExistsException(request.getBrand() + ' ' + request.getName() + "already exists");
//        }

        Category category = Optional.ofNullable(categoryRepo.findByName(request.getCategory().getName()))
                .orElseGet(() -> {
                    Category newCategory = new Category(request.getCategory().getName());
                    return categoryRepo.save(newCategory);
                });
        request.setCategory(category);
        return productRepo.save(createProduct(request, category));
    }
    // ↑↑↑↑↑↑↑↑↑↑ if u want to add product to exist product, instead of create a new entity
    private boolean productExists(String name, String brand){
        return productRepo.existsByNameAndBrand(name, brand);
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
                        () -> new ResourceNotFoundException("Product not found"));
    }

    @Override
    public void deleteProductById(Long id) {
        productRepo.findById(id)
                .ifPresentOrElse(productRepo::delete,
                        () -> {throw new ResourceNotFoundException("Product not found");});
    }

    @Override
    public Product updateProduct(UpdateProductRequest request, Long productId) {
        return productRepo.findById(productId)
                .map(existingProduct -> updateExistingProduct(existingProduct, request))
                .map(productRepo :: save)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
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
        return productRepo.findByCategoryNameIgnoreCase(category);
    }

    @Override
    public List<Product> getProductsByBrand(String brand) {
        return productRepo.findByBrandIgnoreCase(brand);
    }

    @Override
    public List<Product> getProductsByCategoryAndBrand(String category, String brand) {
        return productRepo.findByCategoryNameAndBrand(category, brand);
    }

    @Override
    public List<Product> getProductsByName(String name) {
        return productRepo.findByNameIgnoreCase(name);
    }

    @Override
    public List<Product> getProductsByBrandAndName(String brand, String name) {
        return productRepo.findByBrandAndName(brand, name);
    }

    @Override
    public Long countProductsByBrandAndName(String brand, String name) {
        return productRepo.countByBrandAndName(brand, name);
    }

    @Override
    public List<ProductDto> getConvertedProducts(List<Product> products) {
        return products.stream().map(this::convertToDto).toList();
    }

    @Override
    public ProductDto convertToDto(Product product) {
        ProductDto productDto = modelMapper.map(product, ProductDto.class);
        List<Image> images = imageRepo.findByProductId(product.getId());
        List<ImageDto> imageDtos = images.stream()
                .map(image -> modelMapper.map(image, ImageDto.class))
                .toList();
        productDto.setImages(imageDtos);
        return productDto;
    }
}
