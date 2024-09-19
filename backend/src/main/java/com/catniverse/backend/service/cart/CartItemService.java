package com.catniverse.backend.service.cart;

import com.catniverse.backend.exceptions.ResourceNotFoundException;
import com.catniverse.backend.model.Cart;
import com.catniverse.backend.model.CartItem;
import com.catniverse.backend.model.Product;
import com.catniverse.backend.repo.CartItemRepo;
import com.catniverse.backend.repo.CartRepo;
import com.catniverse.backend.service.product.ImpProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class CartItemService implements ImpCartItemService{
    private final CartItemRepo cartItemRepo;
    private final ImpProductService productService;
    private final ImpCartService cartService;
    private final CartRepo cartRepo;

    @Override
    public void addItemToCart(Long cartId, Long productId, int quantity) {
        //1. get the cart
        //2. get the product
        //3. check if the product already in the cart
        //4. if yes, then increase the quantity with the requested quantity
        //5. if no, then initiate a new cartItem entry
        Cart cart = cartService.getCart(cartId);
        Product product = productService.getProductById(productId);
        CartItem cartItem = cart.getItems()
                .stream()
                .filter(item -> item.getProduct().getId().equals(productId))
                .findFirst().orElse(new CartItem());
        if (cartItem.getId() == null){
            cartItem.setCart(cart);
            cartItem.setProduct(product);
            cartItem.setQuantity(quantity);
            cartItem.setUnitPrice(product.getPrice());
        }
        else{
            cartItem.setQuantity(cartItem.getQuantity() + quantity);
        }
        cartItem.setTotalPrice();
        cart.addItem(cartItem);
        cartItemRepo.save(cartItem);
        cartRepo.save(cart);
    }

    @Override
    public void removeItemFromCart(Long cartId, Long productId) {
        Cart cart = cartService.getCart(cartId);
        CartItem itemToRemove = getCartItem(cartId, productId);
        cart.removeItem(itemToRemove);
        cartRepo.save(cart);
    }

    @Override
    public void updateItemQuantity(Long cartId, Long porductId, int quantity) {
        Cart cart = cartService.getCart(cartId);
        cart.getItems()
                .stream()
                .filter(item -> item.getProduct().getId().equals(porductId))
                .findFirst()
                .ifPresent(item -> {
                    item.setQuantity(quantity);
                    item.setUnitPrice(item.getProduct().getPrice());
                    item.setTotalPrice();
                });
        cart.updateTotalAmount();
        cartRepo.save(cart);
    }

    @Override
    public CartItem getCartItem(Long cartId, Long productId) {
        Cart cart = cartService.getCart(cartId);
        return cart.getItems()
                .stream()
                .filter(item -> item.getProduct().getId().equals(productId))
                .findFirst().orElseThrow(() -> new ResourceNotFoundException("Product not found"));
    }
}
