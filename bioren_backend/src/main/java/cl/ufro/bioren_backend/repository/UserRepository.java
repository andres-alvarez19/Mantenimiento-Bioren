package cl.ufro.bioren_backend.repository;

import cl.ufro.bioren_backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repositorio JPA para la entidad User.
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    // Puedes agregar métodos de consulta personalizados aquí
    User findByEmail(String email);
} 