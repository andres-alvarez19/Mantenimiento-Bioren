package cl.ufro.bioren_backend.model;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonProperty;

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

    /** Hash de la contraseña del usuario */
    @Column(nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @Setter(AccessLevel.PUBLIC)
    @Getter(AccessLevel.PUBLIC)
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;
} 