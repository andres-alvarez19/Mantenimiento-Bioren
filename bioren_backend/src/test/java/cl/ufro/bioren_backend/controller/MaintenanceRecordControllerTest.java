package cl.ufro.bioren_backend.controller;

import cl.ufro.bioren_backend.model.Equipment;
import cl.ufro.bioren_backend.model.MaintenanceRecord;
import cl.ufro.bioren_backend.service.MaintenanceRecordService;
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

@WebMvcTest(controllers = MaintenanceRecordController.class)
class MaintenanceRecordControllerTest {
    @Autowired
    private MockMvc mockMvc;
    @MockBean
    private MaintenanceRecordService maintenanceRecordService;
    @MockBean
    private JwtService jwtService;
    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @WithMockUser(roles = {"BIOREN_ADMIN"})
    void getAllRecordsAsAdminShouldReturnOk() throws Exception {
        Equipment equipment = Equipment.builder().id(10L).name("Microscope").locationUnit("Lab1").build();
        MaintenanceRecord record = MaintenanceRecord.builder().id(100L).equipment(equipment).build();
        when(maintenanceRecordService.getAll(Mockito.any())).thenReturn(Collections.singletonList(record));
        mockMvc.perform(get("/api/maintenance")).andExpect(status().isOk()).andExpect(jsonPath("$[0].id").value(100L));
    }

    @Test
    @WithMockUser(roles = {"BIOREN_ADMIN"})
    void getRecordByIdAsAdminShouldReturnOk() throws Exception {
        Equipment equipment = Equipment.builder().id(10L).name("Microscope").locationUnit("Lab1").build();
        MaintenanceRecord record = MaintenanceRecord.builder().id(100L).equipment(equipment).build();
        when(maintenanceRecordService.getById(Mockito.eq(100L), Mockito.any())).thenReturn(record);
        mockMvc.perform(get("/api/maintenance/100")).andExpect(status().isOk()).andExpect(jsonPath("$.id").value(100L));
    }

    @Test
    @WithMockUser(roles = {"BIOREN_ADMIN"})
    void createRecordAsAdminShouldReturnOk() throws Exception {
        Equipment equipment = Equipment.builder().id(10L).name("Microscope").locationUnit("Lab1").build();
        MaintenanceRecord record = MaintenanceRecord.builder().id(100L).equipment(equipment).build();
        when(maintenanceRecordService.create(Mockito.any(), Mockito.any())).thenReturn(record);
        mockMvc.perform(post("/api/maintenance")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"equipment\":{\"id\":10,\"locationUnit\":\"Lab1\"}}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(100L));
    }

    @Test
    @WithMockUser(roles = {"BIOREN_ADMIN"})
    void updateRecordAsAdminShouldReturnOk() throws Exception {
        Equipment equipment = Equipment.builder().id(10L).name("Microscope").locationUnit("Lab1").build();
        MaintenanceRecord record = MaintenanceRecord.builder().id(100L).equipment(equipment).build();
        when(maintenanceRecordService.update(Mockito.eq(100L), Mockito.any(), Mockito.any())).thenReturn(record);
        mockMvc.perform(put("/api/maintenance/100")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"equipment\":{\"id\":10,\"locationUnit\":\"Lab1\"}}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(100L));
    }

    @Test
    @WithMockUser(roles = {"BIOREN_ADMIN"})
    void deleteRecordAsAdminShouldReturnOk() throws Exception {
        Mockito.doNothing().when(maintenanceRecordService).delete(Mockito.eq(100L), Mockito.any());
        mockMvc.perform(delete("/api/maintenance/100")).andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = {"UNIT_MANAGER"})
    void unitManagerCannotCreateRecordInOtherUnit() throws Exception {
        Mockito.doThrow(new org.springframework.security.access.AccessDeniedException("Forbidden")).when(maintenanceRecordService).create(Mockito.any(), Mockito.any());
        mockMvc.perform(post("/api/maintenance")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"equipment\":{\"id\":11,\"locationUnit\":\"Lab2\"}}"))
                .andExpect(status().isForbidden());
    }
} 