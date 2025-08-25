package cl.ufro.bioren_backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.List;

/**
 * Entidad que representa un registro de mantenimiento de un equipo.
 */
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaintenanceRecord {
    /** Identificador único del registro de mantenimiento */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Fecha del mantenimiento (ISO) */
    private LocalDate date;

    /** Descripción del mantenimiento realizado */
    private String description;

    /** Nombre del responsable que realizó el mantenimiento */
    private String performedBy;

    /** Lista de archivos adjuntos (nombre y URL) */
    @ElementCollection
    private List<Attachment> attachments;

    /** Equipo al que pertenece este registro */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "equipment_id")
    private Equipment equipment;

    /**
     * Clase embebida para adjuntos de mantenimiento.
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
