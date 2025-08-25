package cl.ufro.bioren_backend.controller;

import cl.ufro.bioren_backend.model.IssueReport;
import cl.ufro.bioren_backend.model.User;
import cl.ufro.bioren_backend.security.UserPrincipal;
import cl.ufro.bioren_backend.service.IssueReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controlador REST para la gestión de incidencias.
 */
@RestController
@RequestMapping("/api/issues")
@RequiredArgsConstructor
public class IssueReportController {
    private final IssueReportService issueReportService;

    /**
     * Obtiene todas las incidencias visibles para el usuario autenticado.
     */
    @GetMapping
    public List<cl.ufro.bioren_backend.dto.IssueReportResponseDTO> getAll(@AuthenticationPrincipal UserPrincipal principal) {
        User user = principalToUser(principal);
        return issueReportService.getAll(user).stream()
                .map(issueReportService::toDTO)
                .toList();
    }

    /**
     * Obtiene una incidencia por su ID.
     */
    @GetMapping("/{id}")
    public cl.ufro.bioren_backend.dto.IssueReportResponseDTO getById(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal principal) {
        User user = principalToUser(principal);
        return issueReportService.toDTO(issueReportService.getById(id, user));
    }

    /**
     * Crea una nueva incidencia (admin, jefe de unidad o encargado de equipo de su unidad).
     */
    @PostMapping
    @PreAuthorize("hasRole('BIOREN_ADMIN') or hasRole('UNIT_MANAGER') or hasRole('EQUIPMENT_MANAGER')")
    public cl.ufro.bioren_backend.dto.IssueReportResponseDTO create(@RequestBody IssueReport ir, @AuthenticationPrincipal UserPrincipal principal) {
        User user = principalToUser(principal);
        return issueReportService.toDTO(issueReportService.create(ir, user));
    }

    /**
     * Actualiza una incidencia (admin o jefe de unidad de su unidad).
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('BIOREN_ADMIN') or hasRole('UNIT_MANAGER')")
    public cl.ufro.bioren_backend.dto.IssueReportResponseDTO update(@PathVariable Long id, @RequestBody IssueReport ir, @AuthenticationPrincipal UserPrincipal principal) {
        User user = principalToUser(principal);
        return issueReportService.toDTO(issueReportService.update(id, ir, user));
    }

    /**
     * Elimina una incidencia (admin o jefe de unidad de su unidad).
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('BIOREN_ADMIN') or hasRole('UNIT_MANAGER')")
    public void delete(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal principal) {
        User user = principalToUser(principal);
        issueReportService.delete(id, user);
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