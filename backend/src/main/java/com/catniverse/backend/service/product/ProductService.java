package com.catniverse.backend.service.product;

import com.catniverse.backend.dto.ProductImageDto;
import com.catniverse.backend.dto.ProductDto;
import com.catniverse.backend.exceptions.ResourceNotFoundException;
import com.catniverse.backend.exceptions.SpecitficNameException;
import com.catniverse.backend.model.*;
import com.catniverse.backend.repo.*;
import com.catniverse.backend.request.AddProductRequest;
import com.catniverse.backend.request.UpdateProductRequest;

import com.catniverse.backend.service.forbidden.ImpForbiddenService;
import jakarta.persistence.EntityNotFoundException;
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
    private final CartItemRepo cartItemRepo;
    private final OrderRepo orderRepo;
    private final ImpForbiddenService forbiddenService;
    private final OrderItemRepo orderItemRepo;

    private final ModelMapper modelMapper;
    private final ImageRepo imageRepo;


    @Override
    public Product addProduct(AddProductRequest request) {
        if(forbiddenService.check(request.getName()) ||
                forbiddenService.check(request.getBrand()) ||
                forbiddenService.check(request.getDescription()) ||
                forbiddenService.check(request.getCategory().getName()))
            throw new SpecitficNameException("請不要使用帥哥的名字，你這個傻逼");
        // check i the category is found in the DB
        // if yes, set it as the new product category
        // if no, then save it as a new category
        //then set as the new product category.

//        if(productExists(request.getName(), request.getBrand())){
//            throw new AlreadyExistsException(request.getBrand() + ' ' + request.getName() + "already exists");
//        }
        else{
            Category category = Optional.ofNullable(categoryRepo.findByName(request.getCategory().getName()))
                    .orElseGet(() -> {
                        Category newCategory = new Category(request.getCategory().getName());
                        return categoryRepo.save(newCategory);
                    });
            request.setCategory(category);
            return productRepo.save(createProduct(request, category));
        }

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
        List<CartItem> cartItems = cartItemRepo.findByProductId(id);
        List<OrderItem> orderItems = orderItemRepo.findByProductId(id);
        productRepo.findById(id)
                .ifPresentOrElse(product -> {
                    // Functional approach for category removal
                    Optional.ofNullable(product.getCategory())
                            .ifPresent(category -> category.getProducts().remove(product));
                    product.setCategory(null);

                    // Functional approach for updating cart items
                    cartItems.stream()
                            .peek(cartItem -> cartItem.setProduct(null))
                            .peek(CartItem::setTotalPrice)
                            .forEach(cartItemRepo::save);

                    // Functional approach for updating order items
                    orderItems.stream()
                            .peek(orderItem -> orderItem.setProduct(null))
                            .forEach(orderItemRepo::save);

                    productRepo.delete(product);
                }, () -> {
                    throw new EntityNotFoundException("Product not found!");
                });
    }

    @Override
    public Product updateProduct(UpdateProductRequest request, Long productId) {
        if(forbiddenService.check(request.getName()) ||
                forbiddenService.check(request.getBrand()) ||
                forbiddenService.check(request.getDescription()) ||
                forbiddenService.check(request.getCategory().getName()))
            throw new SpecitficNameException("請不要使用帥哥的名字，你這個傻逼");
        else
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

        Category category = Optional.ofNullable(categoryRepo.findByName(request.getCategory().getName()))
                .orElseGet(() -> {
                    Category newCategory = new Category(request.getCategory().getName());
                    return categoryRepo.save(newCategory);
                });
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
        List<ProductImage> productImages = imageRepo.findByProductId(product.getId());
        List<ProductImageDto> productImageDtos = productImages.stream()
                .map(image -> modelMapper.map(image, ProductImageDto.class))
                .toList();
        productDto.setImages(productImageDtos);
        return productDto;
    }
}
