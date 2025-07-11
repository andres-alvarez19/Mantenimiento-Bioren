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
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@AutoConfigureTestDatabase
@Transactional
class UserE2ETest {
    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private UserRepository userRepository;

    private String adminToken;
    private String unitManagerToken;

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
    void fullUserFlowAsAdminAndUnitManager() throws Exception {
        // 1. Admin creates a user in LabE2E
        String userJson = "{\"name\":\"User E2E\",\"email\":\"user@e2e.com\",\"role\":\"EQUIPMENT_MANAGER\",\"unit\":\"LabE2E\"}";
        MvcResult createResult = mockMvc.perform(post("/api/users")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(userJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("User E2E"))
                .andReturn();
        Long userId = objectMapper.readTree(createResult.getResponse().getContentAsString()).get("id").asLong();

        // 2. Unit manager gets all users in their unit
        mockMvc.perform(get("/api/users")
                .header("Authorization", "Bearer " + unitManagerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].unit").value("LabE2E"));

        // 3. Unit manager updates user in their unit
        String updatedJson = "{\"name\":\"User E2E Updated\",\"email\":\"user@e2e.com\",\"role\":\"EQUIPMENT_MANAGER\",\"unit\":\"LabE2E\"}";
        mockMvc.perform(put("/api/users/" + userId)
                .header("Authorization", "Bearer " + unitManagerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(updatedJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("User E2E Updated"));

        // 4. Unit manager tries to create user in another unit (should be forbidden)
        String otherUnitJson = "{\"name\":\"User Other\",\"email\":\"other@e2e.com\",\"role\":\"EQUIPMENT_MANAGER\",\"unit\":\"OtherUnit\"}";
        mockMvc.perform(post("/api/users")
                .header("Authorization", "Bearer " + unitManagerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(otherUnitJson))
                .andExpect(status().isForbidden());

        // 5. Admin deletes the user
        mockMvc.perform(delete("/api/users/" + userId)
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());
    }
} 