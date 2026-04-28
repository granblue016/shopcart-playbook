package com.shopcart.backend.repository;

import com.shopcart.backend.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    // Tìm kiếm sản phẩm theo category (phục vụ các tab Audio, Wearables... trên UI)
    List<Product> findByCategoryIgnoreCase(String category);
}