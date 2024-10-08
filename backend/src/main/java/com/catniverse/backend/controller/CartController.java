package com.catniverse.backend.controller;

import com.catniverse.backend.dto.CartDto;
import com.catniverse.backend.exceptions.ResourceNotFoundException;
import com.catniverse.backend.model.Cart;
import com.catniverse.backend.model.User;
import com.catniverse.backend.response.ApiResponse;
import com.catniverse.backend.service.cart.ImpCartService;
import com.catniverse.backend.service.user.ImpUserService;
import com.catniverse.backend.service.user.UserService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

import static org.springframework.http.HttpStatus.NOT_FOUND;

@CrossOrigin
@RequiredArgsConstructor
@RestController
@RequestMapping("${api.prefix}/carts")
public class CartController {
    private final ImpCartService cartService;
    private final ImpUserService userService;

    @GetMapping("/user-cart")
    public ResponseEntity<ApiResponse> getCart() {
        try {
            User user = userService.getAuthenticatedUser();
            Cart cart = cartService.getCart(user.getCart().getId());
            CartDto cartDto = cartService.convertToDto(cart);
            return ResponseEntity.ok(new ApiResponse("Success", cartDto));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(NOT_FOUND).body(new ApiResponse(e.getMessage(), null));
        }
    }
    @Transactional
    @DeleteMapping("/clear")
    public ResponseEntity<ApiResponse> clearCart() {
        try {
            User user = userService.getAuthenticatedUser();
            cartService.clearCart(user.getCart().getId());
            return ResponseEntity.ok(new ApiResponse("Clear Cart Success", null));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(NOT_FOUND).body(new ApiResponse(e.getMessage(), null));
        }
    }

    @GetMapping("/{cartId}/cart/total-price")
    public ResponseEntity<ApiResponse> getTotalAmount(@PathVariable Long cartId) {
        try {
            BigDecimal totalPrice = cartService.getTotalPrice(cartId);
            return ResponseEntity.ok(new ApiResponse("Total Price", totalPrice));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(NOT_FOUND).body(new ApiResponse(e.getMessage(), null));
        }
    }
}
