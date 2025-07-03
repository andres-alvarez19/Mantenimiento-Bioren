package cl.ufro.bioren_backend.repository;

import cl.ufro.bioren_backend.model.Equipment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repositorio JPA para la entidad Equipment.
 */
@Repository
public interface EquipmentRepository extends JpaRepository<Equipment, Long> {
    // Ejemplo de método personalizado: buscar por unidad
    List<Equipment> findByLocationUnit(String locationUnit);
} 