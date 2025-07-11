package cl.ufro.bioren_backend.controller;

import cl.ufro.bioren_backend.model.Equipment;
import cl.ufro.bioren_backend.model.User;
import cl.ufro.bioren_backend.security.UserPrincipal;
import cl.ufro.bioren_backend.service.EquipmentService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Controlador REST para la gestión de equipos.
 */
@RestController
@RequestMapping("/api/equipment")
@RequiredArgsConstructor
public class EquipmentController {
    private final EquipmentService equipmentService;

    /**
     * Obtiene todos los equipos visibles para el usuario autenticado.
     */
    @GetMapping
    public List<Equipment.EquipmentDTO> getAll(@AuthenticationPrincipal UserPrincipal principal) {
        User user = principalToUser(principal);
        List<Equipment> equipos = equipmentService.getAllEquipments(user);
        // Calcular próxima mantención y status para cada equipo
        equipos.forEach(Equipment::calcularProximaMantencionYStatus);
        return equipos.stream().map(this::toDTO).collect(Collectors.toList());
    }

    /**
     * Obtiene un equipo por su ID.
     */
    @GetMapping("/{id}")
    public Equipment.EquipmentDTO getById(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal principal) {
        User user = principalToUser(principal);
        Equipment eq = equipmentService.getEquipmentById(id, user);
        eq.calcularProximaMantencionYStatus();
        return toDTO(eq);
    }

    /**
     * Crea un nuevo equipo (solo admin o jefe de unidad de su unidad).
     */
    @PostMapping
    @PreAuthorize("hasRole('BIOREN_ADMIN') or hasRole('UNIT_MANAGER')")
    public Equipment create(@RequestBody Equipment equipment, @AuthenticationPrincipal UserPrincipal principal) {
        User user = principalToUser(principal);
        return equipmentService.createEquipment(equipment, user);
    }

    /**
     * Actualiza un equipo existente (solo admin o jefe de unidad de su unidad).
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('BIOREN_ADMIN') or hasRole('UNIT_MANAGER')")
    public Equipment update(@PathVariable Long id, @RequestBody Equipment equipment, @AuthenticationPrincipal UserPrincipal principal) {
        User user = principalToUser(principal);
        return equipmentService.updateEquipment(id, equipment, user);
    }

    /**
     * Elimina un equipo (solo admin).
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('BIOREN_ADMIN')")
    public void delete(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal principal) {
        User user = principalToUser(principal);
        equipmentService.deleteEquipment(id, user);
    }

    /**
     * Verifica si existe un equipo con el institutionalId dado.
     */
    @GetMapping("/exists/institutionalId/{institutionalId}")
    public boolean existsByInstitutionalId(@PathVariable String institutionalId) {
        return equipmentService.existsByInstitutionalId(institutionalId);
    }

    @Data
    public static class CreateEquipmentRequest {
        private String institutionalId;
    }

    private Equipment.EquipmentDTO toDTO(Equipment eq) {
        Equipment.UserDTO encargadoDTO = null;
        if (eq.getEncargado() != null) {
            encargadoDTO = new Equipment.UserDTO(
                eq.getEncargado().getId(),
                eq.getEncargado().getName(),
                eq.getEncargado().getEmail(),
                eq.getEncargado().getRole() != null ? eq.getEncargado().getRole().name() : null,
                eq.getEncargado().getUnit()
            );
        }
        return new Equipment.EquipmentDTO(
            eq.getId(),
            eq.getInstitutionalId(),
            eq.getName(),
            eq.getBrand(),
            eq.getModel(),
            eq.getLocationBuilding(),
            eq.getLocationUnit(),
            eq.getLastCalibrationDate(),
            eq.getLastMaintenanceDate(),
            encargadoDTO,
            eq.getMaintenanceFrequency(),
            eq.getMaintenanceRecords(),
            eq.getCustomMaintenanceInstructions(),
            eq.getCriticality(),
            eq.getStatus(),
            eq.getNextMaintenanceDate(),
            eq.getPurchasedByGovernment()
        );
    }

    /**
     * Convierte UserPrincipal a User (puedes mejorar esto con un mapper o servicio).
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