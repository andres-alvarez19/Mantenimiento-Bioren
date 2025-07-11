package cl.ufro.bioren_backend.controller;

import cl.ufro.bioren_backend.model.Equipment;
import cl.ufro.bioren_backend.model.UserRole;
import cl.ufro.bioren_backend.service.EquipmentService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Integration tests for EquipmentController.
 */
@WebMvcTest(controllers = EquipmentController.class)
@Import(cl.ufro.bioren_backend.config.TestSecurityConfig.class)
class EquipmentControllerTest {
    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private EquipmentService equipmentService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @WithMockUser(username = "admin@test.com", roles = {"BIOREN_ADMIN"})
    void getAllEquipmentsAsAdminShouldReturnOk() throws Exception {
        Equipment equipment = Equipment.builder().id(10L).name("Microscope").locationUnit("Lab1").build();
        when(equipmentService.getAllEquipments(Mockito.any())).thenReturn(Collections.singletonList(equipment));

        mockMvc.perform(get("/api/equipment")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Microscope"));
    }

    @Test
    @WithMockUser(username = "admin@test.com", roles = {"BIOREN_ADMIN"})
    void getEquipmentByIdAsAdminShouldReturnOk() throws Exception {
        Equipment equipment = Equipment.builder().id(10L).name("Microscope").locationUnit("Lab1").build();
        when(equipmentService.getEquipmentById(Mockito.eq(10L), Mockito.any())).thenReturn(equipment);

        mockMvc.perform(get("/api/equipment/10")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Microscope"));
    }

    @Test
    @WithMockUser(username = "admin@test.com", roles = {"BIOREN_ADMIN"})
    void createEquipmentAsAdminShouldReturnOk() throws Exception {
        Equipment equipment = Equipment.builder().id(10L).name("Microscope").locationUnit("Lab1").build();
        when(equipmentService.createEquipment(Mockito.any(), Mockito.any())).thenReturn(equipment);
        mockMvc.perform(post("/api/equipment")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Microscope\",\"locationUnit\":\"Lab1\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Microscope"));
    }

    @Test
    @WithMockUser(username = "admin@test.com", roles = {"BIOREN_ADMIN"})
    void updateEquipmentAsAdminShouldReturnOk() throws Exception {
        Equipment equipment = Equipment.builder().id(10L).name("Updated").locationUnit("Lab1").build();
        when(equipmentService.updateEquipment(Mockito.eq(10L), Mockito.any(), Mockito.any())).thenReturn(equipment);
        mockMvc.perform(put("/api/equipment/10")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Updated\",\"locationUnit\":\"Lab1\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated"));
    }

    @Test
    @WithMockUser(username = "admin@test.com", roles = {"BIOREN_ADMIN"})
    void deleteEquipmentAsAdminShouldReturnOk() throws Exception {
        Mockito.doNothing().when(equipmentService).deleteEquipment(Mockito.eq(10L), Mockito.any());
        mockMvc.perform(delete("/api/equipment/10"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "manager@test.com", roles = {"EQUIPMENT_MANAGER"})
    void equipmentManagerCannotDeleteEquipment() throws Exception {
        Mockito.doThrow(new org.springframework.security.access.AccessDeniedException("Forbidden"))
                .when(equipmentService).deleteEquipment(Mockito.eq(10L), Mockito.any());
        mockMvc.perform(delete("/api/equipment/10"))
                .andExpect(status().isForbidden());
    }
    
    @Test
    void getAllEquipmentsWithoutAuthShouldReturnUnauthorized() throws Exception {
        mockMvc.perform(get("/api/equipment"))
                .andExpect(status().isUnauthorized());
    }
} 