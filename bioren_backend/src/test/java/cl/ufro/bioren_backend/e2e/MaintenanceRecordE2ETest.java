package cl.ufro.bioren_backend.e2e;

import cl.ufro.bioren_backend.model.Equipment;
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
class MaintenanceRecordE2ETest {
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
        // Crear equipo para el mantenimiento
        Equipment eq = Equipment.builder().name("Equipo Mantenimiento").brand("Brand").model("Model").locationBuilding("B1").locationUnit("LabE2E").maintenanceFrequency(new Equipment.MaintenanceFrequency(6, cl.ufro.bioren_backend.model.MaintenanceFrequencyUnit.MONTHS)).criticality(cl.ufro.bioren_backend.model.EquipmentCriticality.LOW).build();
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
    void fullMaintenanceRecordFlowAsAdminAndUnitManager() throws Exception {
        // 1. Admin creates a maintenance record
        String recordJson = "{\"equipment\":{\"id\":" + equipmentId + ",\"locationUnit\":\"LabE2E\"},\"description\":\"E2E Maintenance\",\"date\":\"2024-01-01\"}";
        MvcResult createResult = mockMvc.perform(post("/api/maintenance")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(recordJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.description").value("E2E Maintenance"))
                .andReturn();
        Long recordId = objectMapper.readTree(createResult.getResponse().getContentAsString()).get("id").asLong();

        // 2. Unit manager gets all records in their unit
        mockMvc.perform(get("/api/maintenance")
                .header("Authorization", "Bearer " + unitManagerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].equipment.locationUnit").value("LabE2E"));

        // 3. Unit manager updates record in their unit
        String updatedJson = "{\"equipment\":{\"id\":" + equipmentId + ",\"locationUnit\":\"LabE2E\"},\"description\":\"E2E Maintenance Updated\",\"date\":\"2024-01-01\"}";
        mockMvc.perform(put("/api/maintenance/" + recordId)
                .header("Authorization", "Bearer " + unitManagerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(updatedJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.description").value("E2E Maintenance Updated"));

        // 4. Unit manager tries to create record in another unit (should be forbidden)
        String otherUnitJson = "{\"equipment\":{\"id\":" + equipmentId + ",\"locationUnit\":\"OtherUnit\"},\"description\":\"Other Maintenance\",\"date\":\"2024-01-01\"}";
        mockMvc.perform(post("/api/maintenance")
                .header("Authorization", "Bearer " + unitManagerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(otherUnitJson))
                .andExpect(status().isForbidden());

        // 5. Admin deletes the record
        mockMvc.perform(delete("/api/maintenance/" + recordId)
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());
    }
} 