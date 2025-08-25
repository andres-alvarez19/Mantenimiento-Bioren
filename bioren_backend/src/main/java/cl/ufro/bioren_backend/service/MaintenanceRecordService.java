package cl.ufro.bioren_backend.service;

import cl.ufro.bioren_backend.model.Equipment;
import cl.ufro.bioren_backend.model.MaintenanceRecord;
import cl.ufro.bioren_backend.model.User;
import cl.ufro.bioren_backend.model.UserRole;
import cl.ufro.bioren_backend.repository.EquipmentRepository;
import cl.ufro.bioren_backend.repository.MaintenanceRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Servicio para la gestión de registros de mantenimiento, con validación de permisos según el rol del usuario.
 */
@Service
@RequiredArgsConstructor
public class MaintenanceRecordService {
    private final MaintenanceRecordRepository maintenanceRecordRepository;
    private final EquipmentRepository equipmentRepository;

    /**
     * Obtiene todos los registros de mantenimiento visibles para el usuario.
     */
    public List<MaintenanceRecord> getAll(User user) {
        if (user.getRole() == UserRole.BIOREN_ADMIN) {
            return maintenanceRecordRepository.findAll();
        } else {
            // Solo registros de equipos de su unidad
            return maintenanceRecordRepository.findAll().stream()
                    .filter(mr -> {
                        Equipment eq = mr.getEquipment();
                        return eq != null && user.getUnit() != null && user.getUnit().equals(eq.getLocationUnit());
                    })
                    .toList();
        }
    }

    /**
     * Obtiene un registro de mantenimiento por su ID, validando permisos.
     */
    public MaintenanceRecord getById(Long id, User user) {
        MaintenanceRecord mr = maintenanceRecordRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Registro de mantenimiento no encontrado"));
        if (user.getRole() == UserRole.BIOREN_ADMIN ||
            (mr.getEquipment() != null && user.getUnit() != null && user.getUnit().equals(mr.getEquipment().getLocationUnit()))) {
            return mr;
        }
        throw new AccessDeniedException("No tienes permiso para ver este registro de mantenimiento");
    }

    /**
     * Crea un nuevo registro de mantenimiento (admin o jefe de unidad de su unidad).
     */
    public MaintenanceRecord create(MaintenanceRecord mr, User user) {
        Equipment eq = equipmentRepository.findById(mr.getEquipment().getId())
                .orElseThrow(() -> new RuntimeException("Equipo no encontrado"));
        if (user.getRole() == UserRole.BIOREN_ADMIN ||
            (user.getRole() == UserRole.UNIT_MANAGER && user.getUnit().equals(eq.getLocationUnit()))) {
            mr.setEquipment(eq);
            return maintenanceRecordRepository.save(mr);
        }
        throw new AccessDeniedException("No tienes permiso para crear registros en esta unidad");
    }

    /**
     * Actualiza un registro de mantenimiento (admin o jefe de unidad de su unidad).
     */
    public MaintenanceRecord update(Long id, MaintenanceRecord updated, User user) {
        MaintenanceRecord mr = getById(id, user);
        if (user.getRole() == UserRole.BIOREN_ADMIN ||
            (user.getRole() == UserRole.UNIT_MANAGER && user.getUnit().equals(mr.getEquipment().getLocationUnit()))) {
            updated.setId(id);
            updated.setEquipment(mr.getEquipment());
            return maintenanceRecordRepository.save(updated);
        }
        throw new AccessDeniedException("No tienes permiso para editar este registro de mantenimiento");
    }

    /**
     * Elimina un registro de mantenimiento (admin o jefe de unidad de su unidad).
     */
    public void delete(Long id, User user) {
        MaintenanceRecord mr = getById(id, user);
        if (user.getRole() == UserRole.BIOREN_ADMIN ||
            (user.getRole() == UserRole.UNIT_MANAGER && user.getUnit().equals(mr.getEquipment().getLocationUnit()))) {
            maintenanceRecordRepository.deleteById(id);
        } else {
            throw new AccessDeniedException("No tienes permiso para eliminar este registro de mantenimiento");
        }
    }
} 