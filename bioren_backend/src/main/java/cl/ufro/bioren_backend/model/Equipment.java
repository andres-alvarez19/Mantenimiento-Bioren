package cl.ufro.bioren_backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.List;

/**
 * Entidad que representa un equipo institucional.
 */
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Equipment {
    /** Identificador único institucional del equipo */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Nombre del equipo */
    private String name;

    /** Marca del equipo */
    private String brand;

    /** Modelo del equipo */
    private String model;

    /** Edificio donde se encuentra el equipo */
    private String locationBuilding;

    /** Unidad responsable del equipo */
    private String locationUnit;

    /** Fecha de la última calibración (opcional) */
    private LocalDate lastCalibrationDate;

    /** Fecha del último mantenimiento (opcional) */
    private LocalDate lastMaintenanceDate;

    /** Usuario encargado del equipo */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "encargado_id")
    private User encargado;

    /** Frecuencia de mantenimiento */
    @Embedded
    private MaintenanceFrequency maintenanceFrequency;

    /** Registros de mantenimiento asociados al equipo */
    @OneToMany(mappedBy = "equipment", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MaintenanceRecord> maintenanceRecords;

    /** Instrucciones personalizadas de mantenimiento (opcional) */
    private String customMaintenanceInstructions;

    /** Criticidad del equipo */
    @Enumerated(EnumType.STRING)
    private EquipmentCriticality criticality;

    /** Estado calculado del equipo (OK, Advertencia, Vencido) */
    private String status;

    /** Fecha del próximo mantenimiento (calculada) */
    private LocalDate nextMaintenanceDate;

    /** Indica si fue adquirido por el gobierno (opcional) */
    private Boolean purchasedByGovernment;

    /**
     * Clase embebida para la frecuencia de mantenimiento.
     */
    @Embeddable
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MaintenanceFrequency {
        private int value;
        @Enumerated(EnumType.STRING)
        private MaintenanceFrequencyUnit unit;
    }
} 