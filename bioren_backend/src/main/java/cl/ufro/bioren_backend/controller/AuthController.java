package cl.ufro.bioren_backend.controller;

import cl.ufro.bioren_backend.model.User;
import cl.ufro.bioren_backend.repository.UserRepository;
import cl.ufro.bioren_backend.security.JwtService;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

/**
 * Controlador para autenticación de usuarios y emisión de JWT.
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    /**
     * Endpoint de login: recibe email y retorna JWT si el usuario existe.
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail());
        if (user == null || !passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return ResponseEntity.status(401).body("Usuario o contraseña incorrectos");
        }
        String token = jwtService.generateToken(user.getEmail(), user.getRole().name());
        return ResponseEntity.ok(new LoginResponse(token, user));
    }

    /** DTO para la petición de login */
    @Data
    public static class LoginRequest {
        private String email;
        private String password; // opcional, para futuro
    }

    /** DTO para la respuesta de login */
    @Data
    @AllArgsConstructor
    public static class LoginResponse {
        private String token;
        private User user;
    }
} 