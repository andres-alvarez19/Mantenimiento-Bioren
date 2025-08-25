package cl.ufro.bioren_backend.service;

import cl.ufro.bioren_backend.model.User;
import cl.ufro.bioren_backend.model.UserRole;
import cl.ufro.bioren_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Servicio para la gestión de usuarios, con validación de permisos según el rol del usuario.
 */
@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Obtiene todos los usuarios según el rol y unidad del usuario autenticado.
     */
    public List<User> getAllUsers(User user) {
        if (user.getRole() == UserRole.BIOREN_ADMIN) {
            return userRepository.findAll();
        } else {
            return userRepository.findAll().stream()
                    .filter(u -> user.getUnit() != null && user.getUnit().equals(u.getUnit()))
                    .toList();
        }
    }

    /**
     * Obtiene un usuario por su ID, validando permisos.
     */
    public User getUserById(Long id, User user) {
        User target = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        if (user.getRole() == UserRole.BIOREN_ADMIN ||
            (user.getUnit() != null && user.getUnit().equals(target.getUnit()))) {
            return target;
        }
        throw new AccessDeniedException("No tienes permiso para ver este usuario");
    }

    /**
     * Crea un nuevo usuario (solo admin o jefe de unidad para su unidad).
     */
    public User createUser(User newUser, User user) {
        if (user.getRole() == UserRole.BIOREN_ADMIN ||
            (user.getRole() == UserRole.UNIT_MANAGER && user.getUnit().equals(newUser.getUnit()))) {
            if (newUser.getPassword() != null) {
                newUser.setPassword(passwordEncoder.encode(newUser.getPassword()));
            }
            return userRepository.save(newUser);
        }
        throw new AccessDeniedException("No tienes permiso para crear usuarios en esta unidad");
    }

    /**
     * Actualiza un usuario existente (solo admin o jefe de unidad para su unidad).
     */
    public User updateUser(Long id, User updated, User user) {
        User target = getUserById(id, user);
        if (user.getRole() == UserRole.BIOREN_ADMIN ||
            (user.getRole() == UserRole.UNIT_MANAGER && user.getUnit().equals(target.getUnit()))) {
            updated.setId(id);
            if (updated.getPassword() != null && !updated.getPassword().isBlank()) {
                updated.setPassword(passwordEncoder.encode(updated.getPassword()));
            } else {
                updated.setPassword(target.getPassword());
            }
            return userRepository.save(updated);
        }
        throw new AccessDeniedException("No tienes permiso para editar este usuario");
    }

    /**
     * Elimina un usuario (solo admin o jefe de unidad para su unidad).
     */
    public void deleteUser(Long id, User user) {
        User target = getUserById(id, user);
        if (user.getRole() == UserRole.BIOREN_ADMIN ||
            (user.getRole() == UserRole.UNIT_MANAGER && user.getUnit().equals(target.getUnit()))) {
            userRepository.deleteById(id);
        } else {
            throw new AccessDeniedException("No tienes permiso para eliminar este usuario");
        }
    }

    public void changePassword(User user, String currentPassword, String newPassword, PasswordEncoder passwordEncoder) {
        User dbUser = userRepository.findById(user.getId()).orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        if (!passwordEncoder.matches(currentPassword, dbUser.getPassword())) {
            throw new AccessDeniedException("La contraseña actual es incorrecta");
        }
        dbUser.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(dbUser);
    }
} 