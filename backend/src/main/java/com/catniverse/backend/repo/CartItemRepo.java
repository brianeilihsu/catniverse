package com.catniverse.backend.repo;

import com.catniverse.backend.model.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CartItemRepo extends JpaRepository<CartItem, Long> {
    void deleteAllByCartId(Long id);

    List<CartItem> findByProductId(Long id);
}
