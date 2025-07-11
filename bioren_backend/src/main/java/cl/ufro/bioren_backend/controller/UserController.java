package cl.ufro.bioren_backend.controller;

import cl.ufro.bioren_backend.model.User;
import cl.ufro.bioren_backend.security.UserPrincipal;
import cl.ufro.bioren_backend.service.InvitationService;
import cl.ufro.bioren_backend.service.UserService;
import jakarta.mail.MessagingException;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controlador REST para la gestión de usuarios.
 */
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final InvitationService invitationService;

    /**
     * Obtiene todos los usuarios visibles para el usuario autenticado.
     */
    @GetMapping
    public List<User> getAll(@AuthenticationPrincipal UserPrincipal principal) {
        User user = principalToUser(principal);
        return userService.getAllUsers(user);
    }

    /**
     * Obtiene un usuario por su ID.
     */
    @GetMapping("/{id}")
    public User getById(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal principal) {
        User user = principalToUser(principal);
        return userService.getUserById(id, user);
    }

    /**
     * Crea un nuevo usuario (solo admin o jefe de unidad para su unidad).
     */
    @PostMapping
    @PreAuthorize("hasRole('BIOREN_ADMIN') or hasRole('UNIT_MANAGER')")
    public User create(@RequestBody User newUser, @AuthenticationPrincipal UserPrincipal principal) throws MessagingException {
        User user = principalToUser(principal);
        // Crear usuario deshabilitado, sin contraseña
        newUser.setEnabled(false);
        newUser.setMustChangePassword(true);
        newUser.setPassword(null);
        User created = userService.createUser(newUser, user);
        invitationService.createAndSendInvitation(created);
        return created;
    }

    /**
     * Actualiza un usuario existente (solo admin o jefe de unidad para su unidad).
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('BIOREN_ADMIN') or hasRole('UNIT_MANAGER')")
    public User update(@PathVariable Long id, @RequestBody User updated, @AuthenticationPrincipal UserPrincipal principal) {
        User user = principalToUser(principal);
        return userService.updateUser(id, updated, user);
    }

    /**
     * Elimina un usuario (solo admin o jefe de unidad para su unidad).
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('BIOREN_ADMIN') or hasRole('UNIT_MANAGER')")
    public void delete(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal principal) {
        User user = principalToUser(principal);
        userService.deleteUser(id, user);
    }

    /**
     * Endpoint para cambiar la contraseña del usuario autenticado.
     */
    @PostMapping("/change-password")
    public void changePassword(@RequestBody ChangePasswordRequest req, @AuthenticationPrincipal UserPrincipal principal) {
        User user = principalToUser(principal);
        userService.changePassword(user, req.getCurrentPassword(), req.getNewPassword(), passwordEncoder);
    }

    /**
     * Reenvía la invitación a un usuario (solo admin o jefe de unidad para su unidad).
     */
    @PostMapping("/{id}/resend-invitation")
    @PreAuthorize("hasRole('BIOREN_ADMIN') or hasRole('UNIT_MANAGER')")
    public void resendInvitation(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal principal) throws MessagingException {
        User user = principalToUser(principal);
        User target = userService.getUserById(id, user);
        invitationService.createAndSendInvitation(target);
    }

    @Data
    public static class ChangePasswordRequest {
        private String currentPassword;
        private String newPassword;
    }

    /**
     * Convierte UserPrincipal a User.
     */
    private User principalToUser(UserPrincipal principal) {
        return User.builder()
                .id(principal.getId())
                .name(principal.getName())
                .email(principal.getEmail())
                .role(principal.getRole())
                .unit(principal.getUnit())
                .build();
    }
} 