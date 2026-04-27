package com.shopcart.backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long orderId; // Khớp với orderId trong types.ts

    private Double subtotal;
    private Double discount;
    private Double shippingFee;
    private Double total;

    @Embedded
    private ShippingInfo shipping;

    private LocalDateTime createdAt;

    // Một Order có nhiều OrderItem
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<OrderItem> items = new ArrayList<>();
}