package cl.ufro.bioren_backend.controller;

import cl.ufro.bioren_backend.model.User;
import cl.ufro.bioren_backend.repository.UserRepository;
import cl.ufro.bioren_backend.security.JwtService;
import cl.ufro.bioren_backend.service.PasswordResetService;
import jakarta.mail.MessagingException;
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
    private final PasswordResetService passwordResetService;

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

    /**
     * Endpoint para solicitar recuperación de contraseña.
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest req) throws MessagingException {
        User user = userRepository.findByEmail(req.getEmail());
        if (user == null) {
            return ResponseEntity.status(404).body("Usuario no encontrado");
        }
        passwordResetService.createAndSendResetToken(user);
        return ResponseEntity.ok().build();
    }

    /**
     * Endpoint para definir nueva contraseña usando token.
     */
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest req) {
        if (req.getPassword() == null || req.getPassword().length() < 12) {
            return ResponseEntity.status(400).body("La contraseña debe tener al menos 12 caracteres");
        }
        if (passwordResetService.validateToken(req.getToken()).isEmpty()) {
            return ResponseEntity.status(400).body("Token inválido o expirado");
        }
        String passwordHash = passwordEncoder.encode(req.getPassword());
        passwordResetService.resetPassword(req.getToken(), passwordHash);
        return ResponseEntity.ok().build();
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

    @Data
    public static class ForgotPasswordRequest {
        private String email;
    }
    @Data
    public static class ResetPasswordRequest {
        private String token;
        private String password;
    }
} 