package com.catniverse.backend.service.order;

import com.catniverse.backend.enums.OrderStatus;
import com.catniverse.backend.exceptions.ResourceNotFoundException;
import com.catniverse.backend.model.Cart;
import com.catniverse.backend.model.Order;
import com.catniverse.backend.model.OrderItem;
import com.catniverse.backend.model.Product;
import com.catniverse.backend.repo.CartRepo;
import com.catniverse.backend.repo.OrderRepo;
import com.catniverse.backend.repo.ProductRepo;
import com.catniverse.backend.service.cart.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService implements ImpOrderService{
    private final OrderRepo orderRepo;
    private final ProductRepo productRepo;
    private final CartService cartService;

    @Override
    public Order placeOrder(Long userId) {
        Cart cart = cartService.getCartByUserId();
        Order order = createOrder(cart);
        List<OrderItem> orderItemList = createOrderItems(order, cart);
        order.setOrderItems(new HashSet<>(orderItemList));
        order.setTotalAmount(calculateTotalAmount(orderItemList));
        Order savedOrder = orderRepo.save(order);
        cartService.clearCart(cart.getId());
        return savedOrder;
    }
    // ↑↑↑↑↑↑↑↑↑↑
    private Order createOrder(Cart cart) {
        Order order = new Order();
        order.setUser(cart.getUser());
        order.setOrderStatus(OrderStatus.PENDING);
        order.setOrderDate(LocalDate.now());
        return order;
    }
    // ↑↑↑↑↑↑↑↑↑↑ keep track of the inventory
    private List<OrderItem> createOrderItems(Order order, Cart cart) {
        return cart.getItems()
                .stream()
                .map(cartItem -> {
                    Product product = cartItem.getProduct();
                    product.setInventory(product.getInventory() - cartItem.getQuantity());
                    productRepo.save(product);
                    return new OrderItem(
                            order,
                            product,
                            cartItem.getQuantity(),
                            cartItem.getUnitPrice()
                    );
                }).toList();
    }
    // ↑↑↑↑↑↑↑↑↑↑
    private BigDecimal calculateTotalAmount(List<OrderItem> orderItemList){
        return orderItemList
                .stream()
                .map(item -> item.getPrice()
                        .multiply(new BigDecimal(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }



    @Override
    public Order getOrder(Long orderId) {
        return orderRepo.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
    }
}
