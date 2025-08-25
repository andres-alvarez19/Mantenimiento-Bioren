package cl.ufro.bioren_backend.service;

import cl.ufro.bioren_backend.model.InvitationToken;
import cl.ufro.bioren_backend.model.User;
import cl.ufro.bioren_backend.repository.InvitationTokenRepository;
import cl.ufro.bioren_backend.repository.UserRepository;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class InvitationService {
    private final InvitationTokenRepository invitationTokenRepository;
    private final UserRepository userRepository;
    private final JavaMailSender mailSender;

    @Value("${jwt.secret:default_secret_key_for_dev}")
    private String jwtSecret;

    @Value("${bioren.invitation.expiry-hours:24}")
    private int invitationExpiryHours;

    @Value("${bioren.frontend.base-url:https://midominio.com}")
    private String frontendBaseUrl;

    public InvitationToken createAndSendInvitation(User user) throws MessagingException {
        // Eliminar tokens previos
        invitationTokenRepository.deleteByUser(user);
        // Generar token JWT
        String token = Jwts.builder()
                .setSubject(user.getId().toString())
                .setExpiration(Date.from(LocalDateTime.now().plusHours(invitationExpiryHours).atZone(ZoneId.systemDefault()).toInstant()))
                .signWith(SignatureAlgorithm.HS256, jwtSecret.getBytes())
                .compact();
        InvitationToken invitationToken = InvitationToken.builder()
                .user(user)
                .token(token)
                .expiry(LocalDateTime.now().plusHours(invitationExpiryHours))
                .build();
        invitationTokenRepository.save(invitationToken);
        sendInvitationEmail(user.getEmail(), token);
        return invitationToken;
    }

    public Optional<InvitationToken> validateToken(String token) {
        Optional<InvitationToken> invitationToken = invitationTokenRepository.findByToken(token);
        if (invitationToken.isPresent() && invitationToken.get().getExpiry().isAfter(LocalDateTime.now())) {
            return invitationToken;
        }
        return Optional.empty();
    }

    @Transactional
    public void activateUser(String token, String newPassword, String passwordHash) {
        InvitationToken invitationToken = invitationTokenRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Token de invitación inválido"));
        User user = invitationToken.getUser();
        user.setPassword(passwordHash);
        user.setEnabled(true);
        user.setMustChangePassword(false);
        userRepository.save(user);
        invitationTokenRepository.deleteByUser(user);
    }

    public void sendInvitationEmail(String email, String token) throws MessagingException {
        String link = frontendBaseUrl + "/invite/" + token;
        String subject = "Activa tu cuenta";
        String text = "Hola,\n\nHas sido invitado a la plataforma. Haz clic en el siguiente enlace para activar tu cuenta y definir tu contraseña:\n" + link + "\n\nEste enlace expirará en 24 horas.";
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);
        helper.setTo(email);
        helper.setSubject(subject);
        helper.setText(text);
        mailSender.send(message);
    }
} 