package com.shopcart.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "order_items")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class OrderItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Khớp với các trường của CartItem trong types.ts
    private Long productId;
    private String name;
    private Double price;
    private Integer quantity;
    private Integer stock;
    private String image;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    @JsonIgnore // Cực kỳ quan trọng: Ngăn chặn lỗi vòng lặp vô hạn khi trả về JSON
    private Order order;
}