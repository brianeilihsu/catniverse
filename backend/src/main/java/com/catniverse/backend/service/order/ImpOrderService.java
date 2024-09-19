package com.catniverse.backend.service.order;

import com.catniverse.backend.dto.OrderDto;
import com.catniverse.backend.model.Order;

import java.util.List;

public interface ImpOrderService {
    Order placeOrder(Long userId);
    OrderDto getOrder(Long orderId);

    List<OrderDto> getUserOrders(Long userId);
}
