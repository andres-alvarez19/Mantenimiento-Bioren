package cl.ufro.bioren_backend.service;

import cl.ufro.bioren_backend.model.Equipment;
import cl.ufro.bioren_backend.model.User;
import cl.ufro.bioren_backend.model.UserRole;
import cl.ufro.bioren_backend.repository.EquipmentRepository;
import cl.ufro.bioren_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * Servicio para la gestión de equipos, con validación de permisos según el rol del usuario.
 */
@Service
@RequiredArgsConstructor
public class EquipmentService {
    private final EquipmentRepository equipmentRepository;
    private final UserRepository userRepository;

    /**
     * Obtiene todos los equipos según el rol y unidad del usuario.
     */
    public List<Equipment> getAllEquipments(User user) {
        if (user.getRole() == UserRole.BIOREN_ADMIN) {
            return equipmentRepository.findAll();
        } else {
            return equipmentRepository.findByLocationUnit(user.getUnit());
        }
    }

    /**
     * Obtiene un equipo por su ID, validando permisos.
     */
    public Equipment getEquipmentById(Long id, User user) {
        Equipment equipment = equipmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Equipo no encontrado"));
        if (user.getRole() == UserRole.BIOREN_ADMIN ||
            (user.getUnit() != null && user.getUnit().equals(equipment.getLocationUnit()))) {
            return equipment;
        }
        throw new AccessDeniedException("No tienes permiso para ver este equipo");
    }

    /**
     * Crea un nuevo equipo (solo admin o jefe de unidad de su unidad).
     */
    public Equipment createEquipment(Equipment equipment, User user) {
        if (user.getRole() == UserRole.BIOREN_ADMIN ||
            (user.getRole() == UserRole.UNIT_MANAGER && user.getUnit().equals(equipment.getLocationUnit()))) {
            return equipmentRepository.save(equipment);
        }
        throw new AccessDeniedException("No tienes permiso para crear equipos en esta unidad");
    }

    /**
     * Actualiza un equipo existente (solo admin o jefe de unidad de su unidad).
     */
    public Equipment updateEquipment(Long id, Equipment updated, User user) {
        Equipment equipment = getEquipmentById(id, user);
        if (user.getRole() == UserRole.BIOREN_ADMIN ||
            (user.getRole() == UserRole.UNIT_MANAGER && user.getUnit().equals(equipment.getLocationUnit()))) {
            updated.setId(id);
            return equipmentRepository.save(updated);
        }
        throw new AccessDeniedException("No tienes permiso para editar este equipo");
    }

    /**
     * Elimina un equipo (solo admin).
     */
    public void deleteEquipment(Long id, User user) {
        if (user.getRole() == UserRole.BIOREN_ADMIN) {
            equipmentRepository.deleteById(id);
        } else {
            throw new AccessDeniedException("Solo el administrador puede eliminar equipos");
        }
    }
} 