package com.catniverse.backend.service.order;

import com.catniverse.backend.model.Order;

public interface ImpOrderService {
    Order placeOrder(Long userId);
    Order getOrder(Long orderId);
}
