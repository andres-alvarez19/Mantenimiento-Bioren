package cl.ufro.bioren_backend.service;

import cl.ufro.bioren_backend.model.User;
import cl.ufro.bioren_backend.model.UserRole;
import cl.ufro.bioren_backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.access.AccessDeniedException;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class UserServiceTest {
    @Mock
    private UserRepository userRepository;
    @InjectMocks
    private UserService userService;
    private User admin;
    private User unitManager;
    private User userInLab1;
    private User userInLab2;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        admin = User.builder().id(1L).name("Admin").email("admin@test.com").role(UserRole.BIOREN_ADMIN).build();
        unitManager = User.builder().id(2L).name("Manager").email("manager@test.com").role(UserRole.UNIT_MANAGER).unit("Lab1").build();
        userInLab1 = User.builder().id(3L).name("User1").email("user1@test.com").role(UserRole.EQUIPMENT_MANAGER).unit("Lab1").build();
        userInLab2 = User.builder().id(4L).name("User2").email("user2@test.com").role(UserRole.EQUIPMENT_MANAGER).unit("Lab2").build();
    }

    @Test
    void adminCanGetAllUsers() {
        when(userRepository.findAll()).thenReturn(Arrays.asList(userInLab1, userInLab2));
        List<User> result = userService.getAllUsers(admin);
        assertEquals(2, result.size());
    }

    @Test
    void unitManagerCanGetUsersOfTheirUnit() {
        when(userRepository.findAll()).thenReturn(Arrays.asList(userInLab1, userInLab2));
        List<User> result = userService.getAllUsers(unitManager);
        assertEquals(1, result.size());
        assertEquals("Lab1", result.get(0).getUnit());
    }

    @Test
    void adminCanCreateUser() {
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
        User created = userService.createUser(userInLab1, admin);
        assertEquals(userInLab1.getName(), created.getName());
    }

    @Test
    void unitManagerCanCreateUserInTheirUnit() {
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
        User created = userService.createUser(userInLab1, unitManager);
        assertEquals(userInLab1.getName(), created.getName());
    }

    @Test
    void unitManagerCannotCreateUserInOtherUnit() {
        assertThrows(AccessDeniedException.class, () -> userService.createUser(userInLab2, unitManager));
    }

    @Test
    void adminCanUpdateUser() {
        when(userRepository.findById(3L)).thenReturn(Optional.of(userInLab1));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
        User updated = User.builder().id(3L).name("Updated").email("user1@test.com").role(UserRole.EQUIPMENT_MANAGER).unit("Lab1").build();
        User result = userService.updateUser(3L, updated, admin);
        assertEquals("Updated", result.getName());
    }

    @Test
    void unitManagerCanUpdateUserInTheirUnit() {
        when(userRepository.findById(3L)).thenReturn(Optional.of(userInLab1));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
        User updated = User.builder().id(3L).name("Updated").email("user1@test.com").role(UserRole.EQUIPMENT_MANAGER).unit("Lab1").build();
        User result = userService.updateUser(3L, updated, unitManager);
        assertEquals("Updated", result.getName());
    }

    @Test
    void unitManagerCannotUpdateUserInOtherUnit() {
        when(userRepository.findById(4L)).thenReturn(Optional.of(userInLab2));
        User updated = User.builder().id(4L).name("Updated").email("user2@test.com").role(UserRole.EQUIPMENT_MANAGER).unit("Lab2").build();
        assertThrows(AccessDeniedException.class, () -> userService.updateUser(4L, updated, unitManager));
    }

    @Test
    void adminCanDeleteUser() {
        when(userRepository.findById(3L)).thenReturn(Optional.of(userInLab1));
        assertDoesNotThrow(() -> userService.deleteUser(3L, admin));
        verify(userRepository, times(1)).deleteById(3L);
    }

    @Test
    void unitManagerCanDeleteUserInTheirUnit() {
        when(userRepository.findById(3L)).thenReturn(Optional.of(userInLab1));
        assertDoesNotThrow(() -> userService.deleteUser(3L, unitManager));
        verify(userRepository, times(1)).deleteById(3L);
    }

    @Test
    void unitManagerCannotDeleteUserInOtherUnit() {
        when(userRepository.findById(4L)).thenReturn(Optional.of(userInLab2));
        assertThrows(AccessDeniedException.class, () -> userService.deleteUser(4L, unitManager));
    }
} 