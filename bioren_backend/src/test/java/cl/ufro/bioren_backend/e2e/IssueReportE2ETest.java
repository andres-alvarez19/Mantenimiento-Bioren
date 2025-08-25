package cl.ufro.bioren_backend.e2e;

import cl.ufro.bioren_backend.model.Equipment;
import cl.ufro.bioren_backend.model.IssueReport;
import cl.ufro.bioren_backend.model.User;
import cl.ufro.bioren_backend.model.UserRole;
import cl.ufro.bioren_backend.repository.EquipmentRepository;
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

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@AutoConfigureTestDatabase
@Transactional
class IssueReportE2ETest {
    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private EquipmentRepository equipmentRepository;

    private String adminToken;
    private String unitManagerToken;
    private Long equipmentId;

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
        // Crear equipo para la incidencia
        Equipment eq = Equipment.builder().name("Equipo Incidencia").brand("Brand").model("Model").locationBuilding("B1").locationUnit("LabE2E").maintenanceFrequency(new Equipment.MaintenanceFrequency(6, cl.ufro.bioren_backend.model.MaintenanceFrequencyUnit.MONTHS)).criticality(cl.ufro.bioren_backend.model.EquipmentCriticality.LOW).build();
        equipmentId = equipmentRepository.save(eq).getId();
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
    void fullIssueReportFlowAsAdminAndUnitManager() throws Exception {
        // 1. Admin creates an issue
        String issueJson = "{\"equipment\":{\"id\":" + equipmentId + ",\"locationUnit\":\"LabE2E\"},\"description\":\"E2E Issue\",\"severity\":\"MINOR\",\"status\":\"Abierto\"}";
        MvcResult createResult = mockMvc.perform(post("/api/issues")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(issueJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.description").value("E2E Issue"))
                .andReturn();
        Long issueId = objectMapper.readTree(createResult.getResponse().getContentAsString()).get("id").asLong();

        // 2. Unit manager gets all issues in their unit
        mockMvc.perform(get("/api/issues")
                .header("Authorization", "Bearer " + unitManagerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].equipment.locationUnit").value("LabE2E"));

        // 3. Unit manager updates issue in their unit
        String updatedJson = "{\"equipment\":{\"id\":" + equipmentId + ",\"locationUnit\":\"LabE2E\"},\"description\":\"E2E Issue Updated\",\"severity\":\"MINOR\",\"status\":\"Abierto\"}";
        mockMvc.perform(put("/api/issues/" + issueId)
                .header("Authorization", "Bearer " + unitManagerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(updatedJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.description").value("E2E Issue Updated"));

        // 4. Unit manager tries to create issue in another unit (should be forbidden)
        String otherUnitJson = "{\"equipment\":{\"id\":" + equipmentId + ",\"locationUnit\":\"OtherUnit\"},\"description\":\"Other Issue\",\"severity\":\"MINOR\",\"status\":\"Abierto\"}";
        mockMvc.perform(post("/api/issues")
                .header("Authorization", "Bearer " + unitManagerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(otherUnitJson))
                .andExpect(status().isForbidden());

        // 5. Admin deletes the issue
        mockMvc.perform(delete("/api/issues/" + issueId)
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());
    }
} 