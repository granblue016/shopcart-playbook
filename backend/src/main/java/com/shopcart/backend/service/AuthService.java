package com.shopcart.backend.service;

import com.shopcart.backend.dto.LoginRequest;
import com.shopcart.backend.dto.LoginResponse;
import com.shopcart.backend.model.User;
import com.shopcart.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    public LoginResponse login(LoginRequest request) {
        // 1. Tìm user theo email từ database
        Optional<User> userOptional = userRepository.findByEmail(request.getEmail());

        // 2. Kiểm tra nếu user tồn tại
        if (userOptional.isPresent()) {
            User user = userOptional.get();

            // 3. So sánh mật khẩu (Lưu ý: Đây là so sánh thô, sau này nên dùng BCrypt)
            if (user.getPassword().equals(request.getPassword())) {

                // 4. Trả về thông tin đăng nhập thành công
                // Tạm thời trả về "dummy-token" vì chúng ta chưa cài đặt JWT
                return LoginResponse.builder()
                        .token("fake-jwt-token-for-testing")
                        .user(user)
                        .build();
            }
        }

        // 5. Nếu không tìm thấy hoặc sai mật khẩu, ném ra ngoại lệ
        throw new RuntimeException("Email hoặc mật khẩu không chính xác!");
    }
}