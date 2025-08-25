package cl.ufro.bioren_backend.controller;

import cl.ufro.bioren_backend.model.InvitationToken;
import cl.ufro.bioren_backend.service.InvitationService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/invitations")
@RequiredArgsConstructor
public class InvitationController {
    private final InvitationService invitationService;
    private final PasswordEncoder passwordEncoder;

    /**
     * Valida si el token es válido y no expirado.
     */
    @GetMapping("/validate")
    public ResponseEntity<?> validateToken(@RequestParam String token) {
        Optional<InvitationToken> invitationToken = invitationService.validateToken(token);
        if (invitationToken.isPresent()) {
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.status(400).body("Token inválido o expirado");
        }
    }

    /**
     * Activa la cuenta y define la contraseña.
     */
    @PostMapping("/activate")
    public ResponseEntity<?> activate(@RequestBody ActivateRequest req) {
        Optional<InvitationToken> invitationToken = invitationService.validateToken(req.getToken());
        if (invitationToken.isEmpty()) {
            return ResponseEntity.status(400).body("Token inválido o expirado");
        }
        if (req.getPassword() == null || req.getPassword().length() < 12) {
            return ResponseEntity.status(400).body("La contraseña debe tener al menos 12 caracteres");
        }
        String passwordHash = passwordEncoder.encode(req.getPassword());
        invitationService.activateUser(req.getToken(), req.getPassword(), passwordHash);
        return ResponseEntity.ok().build();
    }

    @Data
    public static class ActivateRequest {
        private String token;
        private String password;
    }
} 