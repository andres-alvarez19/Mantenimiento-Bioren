package cl.ufro.bioren_backend.controller;

import cl.ufro.bioren_backend.model.AppNotification;
import cl.ufro.bioren_backend.model.User;
import cl.ufro.bioren_backend.security.UserPrincipal;
import cl.ufro.bioren_backend.service.AppNotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controlador REST para la gestión de notificaciones.
 */
@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class AppNotificationController {
    private final AppNotificationService notificationService;

    /**
     * Obtiene todas las notificaciones relevantes para el usuario autenticado.
     */
    @GetMapping
    public List<AppNotification> getAll(@AuthenticationPrincipal UserPrincipal principal) {
        User user = principalToUser(principal);
        return notificationService.getAll(user);
    }

    /**
     * Marca una notificación como leída.
     */
    @PutMapping("/{id}/read")
    public AppNotification markAsRead(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal principal) {
        User user = principalToUser(principal);
        return notificationService.markAsRead(id, user);
    }

    /**
     * Elimina una notificación (solo admin).
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('BIOREN_ADMIN')")
    public void delete(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal principal) {
        User user = principalToUser(principal);
        notificationService.delete(id, user);
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