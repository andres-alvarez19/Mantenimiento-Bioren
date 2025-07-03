package cl.ufro.bioren_backend.controller;

import cl.ufro.bioren_backend.model.Equipment;
import cl.ufro.bioren_backend.model.User;
import cl.ufro.bioren_backend.security.UserPrincipal;
import cl.ufro.bioren_backend.service.EquipmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
    public List<Equipment> getAll(@AuthenticationPrincipal UserPrincipal principal) {
        User user = principalToUser(principal);
        return equipmentService.getAllEquipments(user);
    }

    /**
     * Obtiene un equipo por su ID.
     */
    @GetMapping("/{id}")
    public Equipment getById(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal principal) {
        User user = principalToUser(principal);
        return equipmentService.getEquipmentById(id, user);
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