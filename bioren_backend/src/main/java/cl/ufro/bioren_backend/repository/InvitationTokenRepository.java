package cl.ufro.bioren_backend.repository;

import cl.ufro.bioren_backend.model.InvitationToken;
import cl.ufro.bioren_backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface InvitationTokenRepository extends JpaRepository<InvitationToken, Long> {
    Optional<InvitationToken> findByToken(String token);
    List<InvitationToken> findByUser(User user);
    void deleteByUser(User user);
} 