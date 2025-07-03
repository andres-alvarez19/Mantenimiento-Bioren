package cl.ufro.bioren_backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Entidad que representa un reporte de incidencia asociado a un equipo.
 */
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IssueReport {
    /** Identificador único del reporte de incidencia */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Equipo asociado a la incidencia */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "equipment_id")
    private Equipment equipment;

    /** Usuario que reporta la incidencia (nombre o referencia) */
    private String reportedBy;

    /** Fecha y hora del reporte (ISO) */
    private LocalDateTime dateTime;

    /** Descripción de la incidencia */
    private String description;

    /** Severidad de la incidencia */
    @Enumerated(EnumType.STRING)
    private IssueSeverity severity;

    /** Lista de archivos adjuntos (nombre y URL) */
    @ElementCollection
    private List<Attachment> attachments;

    /** Estado de la incidencia */
    private String status;

    /**
     * Clase embebida para adjuntos de incidencia.
     */
    @Embeddable
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Attachment {
        private String name;
        private String url;
    }
} 