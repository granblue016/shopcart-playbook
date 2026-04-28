package com.shopcart.backend.service;

import com.shopcart.backend.model.Product;
import com.shopcart.backend.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    // Lấy toàn bộ danh sách sản phẩm cho trang Home/Shop
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    // Lấy chi tiết một sản phẩm theo ID
    public Optional<Product> getProductById(Long id) {
        return productRepository.findById(id);
    }
}