package com.catniverse.backend.service.cart;

import com.catniverse.backend.model.CartItem;

public interface ImpCartItemService {
    void addItemToCart(Long cartId, Long porductId, int quantity);
    void removeItemFromCart(Long cartId, Long porductId);
    void updateItemQuantity(Long cartId, Long porductId, int quantity);
}
