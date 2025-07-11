package cl.ufro.bioren_backend.e2e;

import cl.ufro.bioren_backend.model.User;
import cl.ufro.bioren_backend.model.UserRole;
import cl.ufro.bioren_backend.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@AutoConfigureTestDatabase
@Transactional
class EquipmentE2ETest {
    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private UserRepository userRepository;

    private String adminToken;

    @BeforeEach
    void setUp() throws Exception {
        // Ensure admin user exists
        if (userRepository.findByEmail("admin@e2e.com") == null) {
            userRepository.save(User.builder()
                    .name("Admin E2E")
                    .email("admin@e2e.com")
                    .role(UserRole.BIOREN_ADMIN)
                    .build());
        }
        // Login and get JWT
        String loginJson = "{\"email\":\"admin@e2e.com\"}";
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(loginJson))
                .andExpect(status().isOk())
                .andReturn();
        String response = result.getResponse().getContentAsString();
        adminToken = objectMapper.readTree(response).get("token").asText();
    }

    @Test
    void fullEquipmentFlowAsAdmin() throws Exception {
        // 1. Create equipment
        String equipmentJson = "{\"name\":\"E2E Microscope\",\"brand\":\"BrandX\",\"model\":\"ModelY\",\"locationBuilding\":\"Building1\",\"locationUnit\":\"LabE2E\",\"maintenanceFrequency\":{\"value\":6,\"unit\":\"MONTHS\"},\"criticality\":\"LOW\"}";
        MvcResult createResult = mockMvc.perform(post("/api/equipment")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(equipmentJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("E2E Microscope"))
                .andReturn();
        Long equipmentId = objectMapper.readTree(createResult.getResponse().getContentAsString()).get("id").asLong();

        // 2. Get all equipments
        mockMvc.perform(get("/api/equipment")
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("E2E Microscope"));

        // 3. Update equipment
        String updatedJson = "{\"name\":\"E2E Microscope Updated\",\"brand\":\"BrandX\",\"model\":\"ModelY\",\"locationBuilding\":\"Building1\",\"locationUnit\":\"LabE2E\",\"maintenanceFrequency\":{\"value\":6,\"unit\":\"MONTHS\"},\"criticality\":\"LOW\"}";
        mockMvc.perform(put("/api/equipment/" + equipmentId)
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(updatedJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("E2E Microscope Updated"));

        // 4. Delete equipment
        mockMvc.perform(delete("/api/equipment/" + equipmentId)
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());

        // 5. Ensure equipment is deleted
        mockMvc.perform(get("/api/equipment")
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.id==" + equipmentId + ")]").doesNotExist());
    }
} 