package cl.ufro.bioren_backend.service;

import cl.ufro.bioren_backend.model.AppNotification;
import cl.ufro.bioren_backend.model.User;
import cl.ufro.bioren_backend.model.UserRole;
import cl.ufro.bioren_backend.repository.AppNotificationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AppNotificationServiceTest {
    @Mock
    private AppNotificationRepository notificationRepository;
    @InjectMocks
    private AppNotificationService notificationService;
    private User admin;
    private User normalUser;
    private AppNotification notification1;
    private AppNotification notification2;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        admin = User.builder().id(1L).name("Admin").email("admin@test.com").role(UserRole.BIOREN_ADMIN).build();
        normalUser = User.builder().id(2L).name("User").email("user@test.com").role(UserRole.EQUIPMENT_MANAGER).unit("Lab1").build();
        notification1 = AppNotification.builder().id(100L).message("Test 1").isRead(false).build();
        notification2 = AppNotification.builder().id(101L).message("Test 2").isRead(false).build();
    }

    @Test
    void adminCanGetAllNotifications() {
        when(notificationRepository.findAll()).thenReturn(Arrays.asList(notification1, notification2));
        List<AppNotification> result = notificationService.getAll(admin);
        assertEquals(2, result.size());
    }

    @Test
    void userCanGetAllNotifications() {
        when(notificationRepository.findAll()).thenReturn(Arrays.asList(notification1, notification2));
        List<AppNotification> result = notificationService.getAll(normalUser);
        assertEquals(2, result.size());
    }

    @Test
    void userCanMarkNotificationAsRead() {
        when(notificationRepository.findById(100L)).thenReturn(Optional.of(notification1));
        when(notificationRepository.save(any(AppNotification.class))).thenReturn(notification1);
        AppNotification result = notificationService.markAsRead(100L, normalUser);
        assertTrue(result.isRead());
    }

    @Test
    void adminCanDeleteNotification() {
        doNothing().when(notificationRepository).deleteById(100L);
        assertDoesNotThrow(() -> notificationService.delete(100L, admin));
        verify(notificationRepository, times(1)).deleteById(100L);
    }

    @Test
    void userCannotDeleteNotification() {
        assertThrows(RuntimeException.class, () -> notificationService.delete(100L, normalUser));
    }
} 