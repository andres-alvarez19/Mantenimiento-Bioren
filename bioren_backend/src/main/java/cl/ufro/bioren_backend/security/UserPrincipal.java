package cl.ufro.bioren_backend.security;

import cl.ufro.bioren_backend.model.User;
import cl.ufro.bioren_backend.model.UserRole;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;

/**
 * Adaptador de la entidad User para el sistema de seguridad de Spring.
 */
@AllArgsConstructor
@Getter
public class UserPrincipal implements UserDetails, java.security.Principal {
    private final Long id;
    private final String name;
    private final String email;
    private final String password = ""; // No se almacena ni usa aquí
    private final UserRole role;
    private final String unit;

    public static UserPrincipal create(User user) {
        return new UserPrincipal(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.getUnit()
        );
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

    @Override
    public String getName() {
        return this.email;
    }
} 