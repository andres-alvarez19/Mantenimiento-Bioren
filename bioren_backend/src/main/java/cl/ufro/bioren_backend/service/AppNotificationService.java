package cl.ufro.bioren_backend.service;

import cl.ufro.bioren_backend.model.AppNotification;
import cl.ufro.bioren_backend.model.User;
import cl.ufro.bioren_backend.model.UserRole;
import cl.ufro.bioren_backend.repository.AppNotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Servicio para la gestión de notificaciones, con filtrado según el usuario.
 */
@Service
@RequiredArgsConstructor
public class AppNotificationService {
    private final AppNotificationRepository notificationRepository;

    /**
     * Obtiene todas las notificaciones relevantes para el usuario.
     * (Aquí se asume que todas son globales, pero puedes filtrar por unidad si lo deseas)
     */
    public List<AppNotification> getAll(User user) {
        if (user.getRole() == UserRole.BIOREN_ADMIN) {
            return notificationRepository.findAll();
        } else {
            // Si quieres filtrar por unidad, deberías agregar un campo de unidad a AppNotification
            return notificationRepository.findAll();
        }
    }

    /**
     * Marca una notificación como leída.
     */
    public AppNotification markAsRead(Long id, User user) {
        AppNotification n = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notificación no encontrada"));
        n.setRead(true);
        return notificationRepository.save(n);
    }

    /**
     * Elimina una notificación (solo admin).
     */
    public void delete(Long id, User user) {
        if (user.getRole() == UserRole.BIOREN_ADMIN) {
            notificationRepository.deleteById(id);
        } else {
            throw new RuntimeException("Solo el administrador puede eliminar notificaciones");
        }
    }
} 