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

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PasswordResetService {
    private final InvitationTokenRepository invitationTokenRepository;
    private final UserRepository userRepository;
    private final JavaMailSender mailSender;

    @Value("${jwt.secret:default_secret_key_for_dev}")
    private String jwtSecret;

    @Value("${bioren.reset.expiry-hours:1}")
    private int resetExpiryHours;

    @Value("${bioren.frontend.base-url:https://midominio.com}")
    private String frontendBaseUrl;

    public void createAndSendResetToken(User user) throws MessagingException {
        // Eliminar tokens previos de recuperación
        invitationTokenRepository.deleteByUser(user);
        String token = Jwts.builder()
                .setSubject(user.getId().toString())
                .setExpiration(Date.from(LocalDateTime.now().plusHours(resetExpiryHours).atZone(ZoneId.systemDefault()).toInstant()))
                .signWith(SignatureAlgorithm.HS256, jwtSecret.getBytes())
                .compact();
        InvitationToken resetToken = InvitationToken.builder()
                .user(user)
                .token(token)
                .expiry(LocalDateTime.now().plusHours(resetExpiryHours))
                .build();
        invitationTokenRepository.save(resetToken);
        sendResetEmail(user.getEmail(), token);
    }

    public Optional<InvitationToken> validateToken(String token) {
        Optional<InvitationToken> invitationToken = invitationTokenRepository.findByToken(token);
        if (invitationToken.isPresent() && invitationToken.get().getExpiry().isAfter(LocalDateTime.now())) {
            return invitationToken;
        }
        return Optional.empty();
    }

    public void resetPassword(String token, String passwordHash) {
        InvitationToken resetToken = invitationTokenRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Token de recuperación inválido"));
        User user = resetToken.getUser();
        user.setPassword(passwordHash);
        user.setMustChangePassword(false);
        user.setEnabled(true);
        userRepository.save(user);
        invitationTokenRepository.deleteByUser(user);
    }

    public void sendResetEmail(String email, String token) throws MessagingException {
        String link = frontendBaseUrl + "/reset-password?token=" + token;
        String subject = "Recupera tu contraseña";
        String text = "Hola,\n\nHas solicitado recuperar tu contraseña. Haz clic en el siguiente enlace para definir una nueva contraseña:\n" + link + "\n\nEste enlace expirará en 1 hora.";
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);
        helper.setTo(email);
        helper.setSubject(subject);
        helper.setText(text);
        mailSender.send(message);
    }
} 