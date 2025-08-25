package cl.ufro.bioren_backend.controller;

import cl.ufro.bioren_backend.model.AppNotification;
import cl.ufro.bioren_backend.service.AppNotificationService;
import cl.ufro.bioren_backend.security.JwtService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import java.util.Collections;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = AppNotificationController.class)
class AppNotificationControllerTest {
    @Autowired
    private MockMvc mockMvc;
    @MockBean
    private AppNotificationService notificationService;
    @MockBean
    private JwtService jwtService;
    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @WithMockUser(roles = {"BIOREN_ADMIN"})
    void getAllNotificationsAsAdminShouldReturnOk() throws Exception {
        AppNotification notification = AppNotification.builder().id(100L).message("Test 1").isRead(false).build();
        when(notificationService.getAll(Mockito.any())).thenReturn(Collections.singletonList(notification));
        mockMvc.perform(get("/api/notifications")).andExpect(status().isOk()).andExpect(jsonPath("$[0].id").value(100L));
    }

    @Test
    @WithMockUser(roles = {"BIOREN_ADMIN"})
    void markNotificationAsReadAsAdminShouldReturnOk() throws Exception {
        AppNotification notification = AppNotification.builder().id(100L).message("Test 1").isRead(true).build();
        when(notificationService.markAsRead(Mockito.eq(100L), Mockito.any())).thenReturn(notification);
        mockMvc.perform(put("/api/notifications/100/read")).andExpect(status().isOk()).andExpect(jsonPath("$.isRead").value(true));
    }

    @Test
    @WithMockUser(roles = {"BIOREN_ADMIN"})
    void deleteNotificationAsAdminShouldReturnOk() throws Exception {
        Mockito.doNothing().when(notificationService).delete(Mockito.eq(100L), Mockito.any());
        mockMvc.perform(delete("/api/notifications/100")).andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = {"EQUIPMENT_MANAGER"})
    void userCannotDeleteNotification() throws Exception {
        Mockito.doThrow(new RuntimeException("Forbidden")).when(notificationService).delete(Mockito.eq(100L), Mockito.any());
        mockMvc.perform(delete("/api/notifications/100")).andExpect(status().isInternalServerError());
    }
} 