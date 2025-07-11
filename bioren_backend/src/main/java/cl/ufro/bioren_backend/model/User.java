package cl.ufro.bioren_backend.model;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonIgnore;

/**
 * Entidad que representa un usuario del sistema.
 */
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    /** Identificador único del usuario */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Nombre completo del usuario */
    private String name;

    /** Correo electrónico del usuario */
    @Column(unique = true, nullable = false)
    private String email;

    /** Rol del usuario en el sistema */
    @Enumerated(EnumType.STRING)
    private UserRole role;

    /** Unidad a la que pertenece el usuario (opcional para administradores) */
    private String unit;

    /** Indica si la cuenta está habilitada */
    @Builder.Default
    private boolean enabled = false;

    /** Indica si el usuario debe cambiar su contraseña al iniciar sesión */
    @Builder.Default
    private boolean mustChangePassword = true;

    /** Hash de la contraseña del usuario */
    @Column(nullable = true)
    private String password;

    /** Tokens de invitación asociados a este usuario */
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private java.util.List<InvitationToken> invitationTokens;
} 