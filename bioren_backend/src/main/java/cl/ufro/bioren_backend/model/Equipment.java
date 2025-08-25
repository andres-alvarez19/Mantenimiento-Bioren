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

    /** Identificador institucional del equipo */
    @Column(unique = true, nullable = false)
    private String institutionalId;

    /** Edificio donde se encuentra el equipo */
    private String locationBuilding;

    /** Unidad responsable del equipo */
    private String locationUnit;

    /** Fecha de la última calibración (opcional) */
    private LocalDate lastCalibrationDate;

    /** Fecha del último mantenimiento (opcional) */
    private LocalDate lastMaintenanceDate;

    /** Fecha de creación del equipo (opcional) */
    private LocalDate createdDate;

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
     * Calcula la próxima mantención y el status del equipo.
     * Si no hay lastMaintenanceDate, usa createdDate.
     */
    public void calcularProximaMantencionYStatus() {
        LocalDate baseDate = this.lastMaintenanceDate != null ? this.lastMaintenanceDate : this.createdDate;
        if (baseDate != null && this.maintenanceFrequency != null && this.maintenanceFrequency.getValue() > 0 && this.maintenanceFrequency.getUnit() != null) {
            LocalDate nextDate = null;
            switch (this.maintenanceFrequency.getUnit()) {
                case DAYS:
                    nextDate = baseDate.plusDays(this.maintenanceFrequency.getValue());
                    break;
                case WEEKS:
                    nextDate = baseDate.plusWeeks(this.maintenanceFrequency.getValue());
                    break;
                case MONTHS:
                    nextDate = baseDate.plusMonths(this.maintenanceFrequency.getValue());
                    break;
                case YEARS:
                    nextDate = baseDate.plusYears(this.maintenanceFrequency.getValue());
                    break;
            }
            this.nextMaintenanceDate = nextDate;
            if (nextDate != null) {
                LocalDate today = LocalDate.now();
                LocalDate oneMonthFromNow = today.plusMonths(1);
                if (nextDate.isBefore(today)) this.status = "Vencido";
                else if (nextDate.isBefore(oneMonthFromNow)) this.status = "Advertencia";
                else this.status = "OK";
            } else {
                this.status = "OK";
            }
        } else {
            this.nextMaintenanceDate = null;
            this.status = "OK";
        }
    }

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

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class EquipmentDTO {
        private Long id;
        private String institutionalId;
        private String name;
        private String brand;
        private String model;
        private String locationBuilding;
        private String locationUnit;
        private LocalDate lastCalibrationDate;
        private LocalDate lastMaintenanceDate;
        private UserDTO encargado;
        private MaintenanceFrequency maintenanceFrequency;
        private List<MaintenanceRecord> maintenanceRecords;
        private String customMaintenanceInstructions;
        private EquipmentCriticality criticality;
        private String status;
        private LocalDate nextMaintenanceDate;
        private Boolean purchasedByGovernment;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class UserDTO {
        private Long id;
        private String name;
        private String email;
        private String role;
        private String unit;
    }
} 