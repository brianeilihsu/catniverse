package com.catniverse.backend.controller;

import com.catniverse.backend.exceptions.ResourceNotFoundException;
import com.catniverse.backend.model.Cart;
import com.catniverse.backend.model.User;
import com.catniverse.backend.response.ApiResponse;
import com.catniverse.backend.service.cart.ImpCartItemService;
import com.catniverse.backend.service.cart.ImpCartService;
import com.catniverse.backend.service.user.ImpUserService;
import io.jsonwebtoken.JwtException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import static org.springframework.http.HttpStatus.NOT_FOUND;
import static org.springframework.http.HttpStatus.UNAUTHORIZED;

@CrossOrigin
@RequiredArgsConstructor
@RestController
@RequestMapping("${api.prefix}/cartItems")
public class CartItemController {
    private final ImpCartItemService cartItemService;
    private final ImpCartService cartService;
    private final ImpUserService userService;

    @PostMapping("/item/add")
    public ResponseEntity<ApiResponse> addItemToCart(@RequestParam Long productId,
                                                     @RequestParam Integer quantity) {

        try {
            User user = userService.getAuthenticatedUser();
            Cart cart = cartService.initializeNewCart(user);

            cartItemService.addItemToCart(cart.getId(), productId, quantity);
            return ResponseEntity.ok(new ApiResponse("Successfully Add Item to Cart id: " + cart.getId(), cart.getId()));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(NOT_FOUND).body(new ApiResponse(e.getMessage(), null));
        } catch (JwtException e){
            return ResponseEntity.status(UNAUTHORIZED).body(new ApiResponse(e.getMessage(), null));
        }
    }

    @DeleteMapping("/item/remove/{itemId}")
    public ResponseEntity<ApiResponse> removeItemFromCart(@PathVariable Long itemId) {
        try {
            User user = userService.getAuthenticatedUser();
            cartItemService.removeItemFromCart(user.getCart().getId(), itemId);
            return ResponseEntity.ok(new ApiResponse("Remove Item Success", null));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(NOT_FOUND).body(new ApiResponse(e.getMessage(), null));
        }
    }

    @PutMapping("/item/update/{itemId}")
    public ResponseEntity<ApiResponse> updateItemQuantity(@PathVariable Long itemId, @RequestParam Integer quantity) {
        try {
            User user = userService.getAuthenticatedUser();
            cartItemService.updateItemQuantity(user.getCart().getId(), itemId, quantity);
            return ResponseEntity.ok(new ApiResponse("Update Item Success", null));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(NOT_FOUND).body(new ApiResponse(e.getMessage(), null));
        }
    }
}
