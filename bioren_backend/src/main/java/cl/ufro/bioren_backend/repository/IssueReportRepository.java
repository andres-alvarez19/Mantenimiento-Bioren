package cl.ufro.bioren_backend.repository;

import cl.ufro.bioren_backend.model.IssueReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repositorio JPA para la entidad IssueReport.
 */
@Repository
public interface IssueReportRepository extends JpaRepository<IssueReport, Long> {
    // Buscar incidencias por equipo
    List<IssueReport> findByEquipmentId(Long equipmentId);
} 