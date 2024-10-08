package com.catniverse.backend.service.cart;

import com.catniverse.backend.dto.CartDto;
import com.catniverse.backend.exceptions.ResourceNotFoundException;
import com.catniverse.backend.model.Cart;
import com.catniverse.backend.model.User;
import com.catniverse.backend.repo.CartItemRepo;
import com.catniverse.backend.repo.CartRepo;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicLong;


@Service
@RequiredArgsConstructor
public class CartService implements ImpCartService{
    private final CartRepo cartRepo;
    private final CartItemRepo cartItemRepo;
    private final ModelMapper modelMapper;
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
    public void clearCart(Long id) { //肏他媽的這白癡cart一直山不掉
        Cart cart = getCart(id);
        cartItemRepo.deleteAllByCartId(id);
        cart.clearCart();
        cartRepo.deleteById(id);
    }

    @Override
    public BigDecimal getTotalPrice(Long id) {
        Cart cart = getCart(id);
        return cart.getTotalAmount();
    }

    @Override
    public Cart initializeNewCart(User user) {
        return Optional.ofNullable(getCartByUserId(user.getId()))
                .orElseGet(() -> {
                    Cart cart = new Cart();
                    cart.setUser(user);
                    return cartRepo.save(cart);
                });
    }

    @Override
    public Cart getCartByUserId(Long userId) {
        return cartRepo.findByUserId(userId);
    }

    @Override
    public CartDto convertToDto(Cart cart) {
//        CartDto cartDto = modelMapper.map(cart, CartDto.class);
//        Set<CartItemDto> cartItemDtos = cart.getItems().stream()
//        cartDto.setItems(cartItemDtos);
        return modelMapper.map(cart, CartDto.class);
    }
}
