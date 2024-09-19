package com.catniverse.backend.service.cart;

import com.catniverse.backend.model.Cart;

import java.math.BigDecimal;

public interface ImpCartService {
    Cart getCart(Long id);
    void clearCart(Long id);
    BigDecimal getTotalPrice(Long id);

    Long initializeNewCart();

    Cart getCartByUserId();
}
