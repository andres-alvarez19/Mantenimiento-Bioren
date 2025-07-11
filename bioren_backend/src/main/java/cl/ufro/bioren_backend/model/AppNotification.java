package cl.ufro.bioren_backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Entidad que representa una notificación de la aplicación.
 */
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppNotification {
    /** Identificador único de la notificación */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Tipo de notificación: info, warning, error, success */
    private String type;

    /** Mensaje principal de la notificación */
    private String message;

    /** Detalles adicionales (opcional) */
    private String details;

    /** Enlace relacionado (opcional) */
    private String link;

    /** Fecha y hora de la notificación */
    private LocalDateTime timestamp;

    /** Indica si la notificación ha sido leída */
    private boolean isRead;
} 