package cl.ufro.bioren_backend.controller;

import cl.ufro.bioren_backend.model.Equipment;
import cl.ufro.bioren_backend.model.IssueReport;
import cl.ufro.bioren_backend.model.UserRole;
import cl.ufro.bioren_backend.service.IssueReportService;
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

@WebMvcTest(controllers = IssueReportController.class)
class IssueReportControllerTest {
    @Autowired
    private MockMvc mockMvc;
    @MockBean
    private IssueReportService issueReportService;
    @MockBean
    private JwtService jwtService;
    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @WithMockUser(roles = {"BIOREN_ADMIN"})
    void getAllIssuesAsAdminShouldReturnOk() throws Exception {
        Equipment equipment = Equipment.builder().id(10L).name("Microscope").locationUnit("Lab1").build();
        IssueReport issue = IssueReport.builder().id(100L).equipment(equipment).build();
        when(issueReportService.getAll(Mockito.any())).thenReturn(Collections.singletonList(issue));
        mockMvc.perform(get("/api/issues")).andExpect(status().isOk()).andExpect(jsonPath("$[0].id").value(100L));
    }

    @Test
    @WithMockUser(roles = {"BIOREN_ADMIN"})
    void getIssueByIdAsAdminShouldReturnOk() throws Exception {
        Equipment equipment = Equipment.builder().id(10L).name("Microscope").locationUnit("Lab1").build();
        IssueReport issue = IssueReport.builder().id(100L).equipment(equipment).build();
        when(issueReportService.getById(Mockito.eq(100L), Mockito.any())).thenReturn(issue);
        mockMvc.perform(get("/api/issues/100")).andExpect(status().isOk()).andExpect(jsonPath("$.id").value(100L));
    }

    @Test
    @WithMockUser(roles = {"BIOREN_ADMIN"})
    void createIssueAsAdminShouldReturnOk() throws Exception {
        Equipment equipment = Equipment.builder().id(10L).name("Microscope").locationUnit("Lab1").build();
        IssueReport issue = IssueReport.builder().id(100L).equipment(equipment).build();
        when(issueReportService.create(Mockito.any(), Mockito.any())).thenReturn(issue);
        mockMvc.perform(post("/api/issues")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"equipment\":{\"id\":10,\"locationUnit\":\"Lab1\"}}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(100L));
    }

    @Test
    @WithMockUser(roles = {"BIOREN_ADMIN"})
    void updateIssueAsAdminShouldReturnOk() throws Exception {
        Equipment equipment = Equipment.builder().id(10L).name("Microscope").locationUnit("Lab1").build();
        IssueReport issue = IssueReport.builder().id(100L).equipment(equipment).build();
        when(issueReportService.update(Mockito.eq(100L), Mockito.any(), Mockito.any())).thenReturn(issue);
        mockMvc.perform(put("/api/issues/100")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"equipment\":{\"id\":10,\"locationUnit\":\"Lab1\"}}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(100L));
    }

    @Test
    @WithMockUser(roles = {"BIOREN_ADMIN"})
    void deleteIssueAsAdminShouldReturnOk() throws Exception {
        Mockito.doNothing().when(issueReportService).delete(Mockito.eq(100L), Mockito.any());
        mockMvc.perform(delete("/api/issues/100")).andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = {"UNIT_MANAGER"})
    void unitManagerCannotCreateIssueInOtherUnit() throws Exception {
        Mockito.doThrow(new org.springframework.security.access.AccessDeniedException("Forbidden")).when(issueReportService).create(Mockito.any(), Mockito.any());
        mockMvc.perform(post("/api/issues")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"equipment\":{\"id\":11,\"locationUnit\":\"Lab2\"}}"))
                .andExpect(status().isForbidden());
    }
} 