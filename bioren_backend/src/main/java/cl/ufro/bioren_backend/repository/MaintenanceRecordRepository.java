package cl.ufro.bioren_backend.repository;

import cl.ufro.bioren_backend.model.MaintenanceRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repositorio JPA para la entidad MaintenanceRecord.
 */
@Repository
public interface MaintenanceRecordRepository extends JpaRepository<MaintenanceRecord, Long> {
    // Buscar registros por equipo
    List<MaintenanceRecord> findByEquipmentId(Long equipmentId);
} 