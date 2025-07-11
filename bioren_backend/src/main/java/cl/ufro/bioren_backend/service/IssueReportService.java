package cl.ufro.bioren_backend.service;

import cl.ufro.bioren_backend.model.Equipment;
import cl.ufro.bioren_backend.model.IssueReport;
import cl.ufro.bioren_backend.model.User;
import cl.ufro.bioren_backend.model.UserRole;
import cl.ufro.bioren_backend.repository.EquipmentRepository;
import cl.ufro.bioren_backend.repository.IssueReportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Servicio para la gestión de incidencias, con validación de permisos según el rol del usuario.
 */
@Service
@RequiredArgsConstructor
public class IssueReportService {
    private final IssueReportRepository issueReportRepository;
    private final EquipmentRepository equipmentRepository;

    /**
     * Obtiene todas las incidencias visibles para el usuario.
     */
    public List<IssueReport> getAll(User user) {
        if (user.getRole() == UserRole.BIOREN_ADMIN) {
            return issueReportRepository.findAll();
        } else {
            // Solo incidencias de equipos de su unidad
            return issueReportRepository.findAll().stream()
                    .filter(ir -> {
                        Equipment eq = ir.getEquipment();
                        return eq != null && user.getUnit() != null && user.getUnit().equals(eq.getLocationUnit());
                    })
                    .toList();
        }
    }

    /**
     * Obtiene una incidencia por su ID, validando permisos.
     */
    public IssueReport getById(Long id, User user) {
        IssueReport ir = issueReportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Incidencia no encontrada"));
        if (user.getRole() == UserRole.BIOREN_ADMIN ||
            (ir.getEquipment() != null && user.getUnit() != null && user.getUnit().equals(ir.getEquipment().getLocationUnit()))) {
            return ir;
        }
        throw new AccessDeniedException("No tienes permiso para ver esta incidencia");
    }

    /**
     * Crea una nueva incidencia (admin, jefe de unidad o encargado de equipo de su unidad).
     */
    public IssueReport create(IssueReport ir, User user) {
        Equipment eq = equipmentRepository.findById(ir.getEquipment().getId())
                .orElseThrow(() -> new RuntimeException("Equipo no encontrado"));
        if (user.getRole() == UserRole.BIOREN_ADMIN ||
            (user.getUnit() != null && user.getUnit().equals(eq.getLocationUnit()))) {
            ir.setEquipment(eq);
            return issueReportRepository.save(ir);
        }
        throw new AccessDeniedException("No tienes permiso para crear incidencias en esta unidad");
    }

    /**
     * Actualiza una incidencia (admin o jefe de unidad de su unidad).
     */
    public IssueReport update(Long id, IssueReport updated, User user) {
        IssueReport ir = getById(id, user);
        if (user.getRole() == UserRole.BIOREN_ADMIN ||
            (user.getRole() == UserRole.UNIT_MANAGER && user.getUnit().equals(ir.getEquipment().getLocationUnit()))) {
            updated.setId(id);
            updated.setEquipment(ir.getEquipment());
            return issueReportRepository.save(updated);
        }
        throw new AccessDeniedException("No tienes permiso para editar esta incidencia");
    }

    /**
     * Elimina una incidencia (admin o jefe de unidad de su unidad).
     */
    public void delete(Long id, User user) {
        IssueReport ir = getById(id, user);
        if (user.getRole() == UserRole.BIOREN_ADMIN ||
            (user.getRole() == UserRole.UNIT_MANAGER && user.getUnit().equals(ir.getEquipment().getLocationUnit()))) {
            issueReportRepository.deleteById(id);
        } else {
            throw new AccessDeniedException("No tienes permiso para eliminar esta incidencia");
        }
    }
} 