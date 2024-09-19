package com.catniverse.backend.service.cart;

import com.catniverse.backend.exceptions.ResourceNotFoundException;
import com.catniverse.backend.model.Cart;
import com.catniverse.backend.repo.CartItemRepo;
import com.catniverse.backend.repo.CartRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.concurrent.atomic.AtomicLong;


@Service
@RequiredArgsConstructor
public class CartService implements ImpCartService{
    private final CartRepo cartRepo;
    private final CartItemRepo cartItemRepo;
    public AtomicLong cartIdGenerator = new AtomicLong(0);

    @Override
    public Cart getCart(Long id) {
        Cart cart = cartRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found"));
        BigDecimal totalAmount = cart.getTotalAmount();
        cart.setTotalAmount(totalAmount);
        return cartRepo.save(cart);
    }

    @Override
    public void clearCart(Long id) {
        Cart cart = getCart(id);
        cartItemRepo.deleteAllByCartId(id);
        cart.getItems().clear();
        cartRepo.deleteById(id);
    }

    @Override
    public BigDecimal getTotalPrice(Long id) {
        Cart cart = getCart(id);
        return cart.getTotalAmount();
    }

    @Override
    public Long initializeNewCart() {
        Cart newCart = new Cart();
        Long newCartId = cartIdGenerator.incrementAndGet();
        newCart.setId(newCartId);
        return cartRepo.save(newCart).getId();
    }

    @Override
    public Cart getCartByUserId() {
        return null;
    }
}
