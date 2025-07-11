package cl.ufro.bioren_backend.controller;

import cl.ufro.bioren_backend.model.MaintenanceRecord;
import cl.ufro.bioren_backend.model.User;
import cl.ufro.bioren_backend.security.UserPrincipal;
import cl.ufro.bioren_backend.service.MaintenanceRecordService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controlador REST para la gestión de registros de mantenimiento.
 */
@RestController
@RequestMapping("/api/maintenance")
@RequiredArgsConstructor
public class MaintenanceRecordController {
    private final MaintenanceRecordService maintenanceRecordService;

    /**
     * Obtiene todos los registros de mantenimiento visibles para el usuario autenticado.
     */
    @GetMapping
    public List<MaintenanceRecord> getAll(@AuthenticationPrincipal UserPrincipal principal) {
        User user = principalToUser(principal);
        return maintenanceRecordService.getAll(user);
    }

    /**
     * Obtiene un registro de mantenimiento por su ID.
     */
    @GetMapping("/{id}")
    public MaintenanceRecord getById(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal principal) {
        User user = principalToUser(principal);
        return maintenanceRecordService.getById(id, user);
    }

    /**
     * Crea un nuevo registro de mantenimiento (admin o jefe de unidad de su unidad).
     */
    @PostMapping
    @PreAuthorize("hasRole('BIOREN_ADMIN') or hasRole('UNIT_MANAGER')")
    public MaintenanceRecord create(@RequestBody MaintenanceRecord mr, @AuthenticationPrincipal UserPrincipal principal) {
        User user = principalToUser(principal);
        return maintenanceRecordService.create(mr, user);
    }

    /**
     * Actualiza un registro de mantenimiento (admin o jefe de unidad de su unidad).
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('BIOREN_ADMIN') or hasRole('UNIT_MANAGER')")
    public MaintenanceRecord update(@PathVariable Long id, @RequestBody MaintenanceRecord mr, @AuthenticationPrincipal UserPrincipal principal) {
        User user = principalToUser(principal);
        return maintenanceRecordService.update(id, mr, user);
    }

    /**
     * Elimina un registro de mantenimiento (admin o jefe de unidad de su unidad).
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('BIOREN_ADMIN') or hasRole('UNIT_MANAGER')")
    public void delete(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal principal) {
        User user = principalToUser(principal);
        maintenanceRecordService.delete(id, user);
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