package com.shopcart.backend.repository; // Theo cấu trúc đã import trong AuthService

import com.shopcart.backend.model.User; // Theo cấu trúc model đã định nghĩa
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Tìm kiếm người dùng qua Email.
     * Phương thức này cực kỳ quan trọng để phục vụ logic Đăng nhập (Login).
     */
    Optional<User> findByEmail(String email);

    // Bạn có thể thêm phương thức tìm theo username nếu cần
    // Optional<User> findByUsername(String username);
}