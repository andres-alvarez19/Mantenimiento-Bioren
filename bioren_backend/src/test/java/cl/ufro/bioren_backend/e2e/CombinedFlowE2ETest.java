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
class CombinedFlowE2ETest {
    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private AppNotificationRepository notificationRepository;

    private String adminToken;
    private String unitManagerToken;
    private String equipmentManagerToken;
    private Long equipmentId;
    private Long issueId;
    private Long notificationId;

    @BeforeEach
    void setUp() throws Exception {
        if (userRepository.findByEmail("admin@e2e.com") == null) {
            userRepository.save(User.builder().name("Admin E2E").email("admin@e2e.com").role(UserRole.BIOREN_ADMIN).build());
        }
        if (userRepository.findByEmail("manager@e2e.com") == null) {
            userRepository.save(User.builder().name("Manager E2E").email("manager@e2e.com").role(UserRole.UNIT_MANAGER).unit("LabE2E").build());
        }
        adminToken = getTokenFor("admin@e2e.com");
        unitManagerToken = getTokenFor("manager@e2e.com");
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
    void combinedFlow() throws Exception {
        // 1. Admin creates a team and an equipment manager
        String equipmentJson = "{\"name\":\"Combo Microscope\",\"brand\":\"BrandX\",\"model\":\"ModelY\",\"locationBuilding\":\"Building1\",\"locationUnit\":\"LabE2E\",\"maintenanceFrequency\":{\"value\":6,\"unit\":\"MONTHS\"},\"criticality\":\"LOW\"}";
        MvcResult eqResult = mockMvc.perform(post("/api/equipment")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(equipmentJson))
                .andExpect(status().isOk())
                .andReturn();
        equipmentId = objectMapper.readTree(eqResult.getResponse().getContentAsString()).get("id").asLong();

        String encJson = "{\"name\":\"Encargado E2E\",\"email\":\"encargado@e2e.com\",\"role\":\"EQUIPMENT_MANAGER\",\"unit\":\"LabE2E\"}";
        mockMvc.perform(post("/api/users")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(encJson))
                .andExpect(status().isOk());
        equipmentManagerToken = getTokenFor("encargado@e2e.com");

        // 2. Equipment manager reports an issue
        String issueJson = "{\"equipment\":{\"id\":" + equipmentId + ",\"locationUnit\":\"LabE2E\"},\"description\":\"Combo Issue\",\"severity\":\"MINOR\",\"status\":\"Abierto\"}";
        MvcResult issueResult = mockMvc.perform(post("/api/issues")
                .header("Authorization", "Bearer " + equipmentManagerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(issueJson))
                .andExpect(status().isOk())
                .andReturn();
        issueId = objectMapper.readTree(issueResult.getResponse().getContentAsString()).get("id").asLong();

        // 3. Unit manager resolves the issue
        String updateIssueJson = "{\"equipment\":{\"id\":" + equipmentId + ",\"locationUnit\":\"LabE2E\"},\"description\":\"Combo Issue\",\"severity\":\"MINOR\",\"status\":\"Resuelto\"}";
        mockMvc.perform(put("/api/issues/" + issueId)
                .header("Authorization", "Bearer " + unitManagerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(updateIssueJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("Resuelto"));

        // 4. Admin creates a notification
        AppNotification n = AppNotification.builder().message("Combo Notification").type("info").timestamp(LocalDateTime.now()).isRead(false).build();
        notificationId = notificationRepository.save(n).getId();

        // 5. Equipment manager sees and marks notification as read
        mockMvc.perform(get("/api/notifications")
                .header("Authorization", "Bearer " + equipmentManagerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].message").value("Combo Notification"));
        mockMvc.perform(put("/api/notifications/" + notificationId + "/read")
                .header("Authorization", "Bearer " + equipmentManagerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isRead").value(true));

        // 6. Admin deletes the issue and notification
        mockMvc.perform(delete("/api/issues/" + issueId)
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());
        mockMvc.perform(delete("/api/notifications/" + notificationId)
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());
    }
} 