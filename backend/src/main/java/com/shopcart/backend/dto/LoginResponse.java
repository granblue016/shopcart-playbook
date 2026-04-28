package com.shopcart.backend.dto;

import com.shopcart.backend.model.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginResponse {
    private String token;
    private User user; // Trả về thông tin user (id, email, name, role) để FE hiển thị
}