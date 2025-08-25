package cl.ufro.bioren_backend.e2e;

import cl.ufro.bioren_backend.model.AppNotification;
import cl.ufro.bioren_backend.model.User;
import cl.ufro.bioren_backend.model.UserRole;
import cl.ufro.bioren_backend.repository.AppNotificationRepository;
import cl.ufro.bioren_backend.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@AutoConfigureTestDatabase
@Transactional
class AppNotificationE2ETest {
    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private AppNotificationRepository notificationRepository;

    private String adminToken;
    private String equipmentManagerToken;
    private Long notificationId;

    @BeforeEach
    void setUp() throws Exception {
        if (userRepository.findByEmail("admin@e2e.com") == null) {
            userRepository.save(User.builder().name("Admin E2E").email("admin@e2e.com").role(UserRole.BIOREN_ADMIN).build());
        }
        if (userRepository.findByEmail("encargado@e2e.com") == null) {
            userRepository.save(User.builder().name("Encargado E2E").email("encargado@e2e.com").role(UserRole.EQUIPMENT_MANAGER).unit("LabE2E").build());
        }
        adminToken = getTokenFor("admin@e2e.com");
        equipmentManagerToken = getTokenFor("encargado@e2e.com");
        // Crear notificación en la base
        AppNotification n = AppNotification.builder().message("E2E Notification").type("info").timestamp(LocalDateTime.now()).isRead(false).build();
        notificationId = notificationRepository.save(n).getId();
    }

    private String getTokenFor(String email) throws Exception {
        String loginJson = "{\"email\":\"" + email + "\"}";
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(loginJson))
                .andExpect(status().isOk())
                .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString()).get("token").asText();
    }

    @Test
    void fullNotificationFlowAsAdminAndEquipmentManager() throws Exception {
        // 1. Admin gets all notifications
        mockMvc.perform(get("/api/notifications")
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].message").value("E2E Notification"));

        // 2. Equipment manager marks as read
        mockMvc.perform(put("/api/notifications/" + notificationId + "/read")
                .header("Authorization", "Bearer " + equipmentManagerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isRead").value(true));

        // 3. Equipment manager tries to delete (should fail)
        mockMvc.perform(delete("/api/notifications/" + notificationId)
                .header("Authorization", "Bearer " + equipmentManagerToken))
                .andExpect(status().isInternalServerError());

        // 4. Admin deletes the notification
        mockMvc.perform(delete("/api/notifications/" + notificationId)
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());
    }
} 