package com.shopcart.backend.model;

import jakarta.persistence.Embeddable;
import lombok.*;

@Embeddable
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class ShippingInfo {
    private String fullName;
    private String address;
    private String city;
    private String postalCode;
    private String phone;
}