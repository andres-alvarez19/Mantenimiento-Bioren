package cl.ufro.bioren_backend.repository;

import cl.ufro.bioren_backend.model.AppNotification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repositorio JPA para la entidad AppNotification.
 */
@Repository
public interface AppNotificationRepository extends JpaRepository<AppNotification, Long> {
    // Puedes agregar métodos personalizados si es necesario
} 