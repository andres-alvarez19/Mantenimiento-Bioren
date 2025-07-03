package cl.ufro.bioren_backend.controller;

import cl.ufro.bioren_backend.model.User;
import cl.ufro.bioren_backend.model.UserRole;
import cl.ufro.bioren_backend.security.UserPrincipal;
import cl.ufro.bioren_backend.service.UserService;
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
import java.util.Arrays;
import java.util.Collections;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = UserController.class)
class UserControllerTest {
    @Autowired
    private MockMvc mockMvc;
    @MockBean
    private UserService userService;
    @MockBean
    private JwtService jwtService;
    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @WithMockUser(roles = {"BIOREN_ADMIN"})
    void getAllUsersAsAdminShouldReturnOk() throws Exception {
        User user = User.builder().id(1L).name("User1").email("user1@test.com").role(UserRole.EQUIPMENT_MANAGER).unit("Lab1").build();
        when(userService.getAllUsers(Mockito.any())).thenReturn(Collections.singletonList(user));
        mockMvc.perform(get("/api/users")).andExpect(status().isOk()).andExpect(jsonPath("$[0].name").value("User1"));
    }

    @Test
    @WithMockUser(roles = {"BIOREN_ADMIN"})
    void getUserByIdAsAdminShouldReturnOk() throws Exception {
        User user = User.builder().id(1L).name("User1").email("user1@test.com").role(UserRole.EQUIPMENT_MANAGER).unit("Lab1").build();
        when(userService.getUserById(Mockito.eq(1L), Mockito.any())).thenReturn(user);
        mockMvc.perform(get("/api/users/1")).andExpect(status().isOk()).andExpect(jsonPath("$.name").value("User1"));
    }

    @Test
    @WithMockUser(roles = {"BIOREN_ADMIN"})
    void createUserAsAdminShouldReturnOk() throws Exception {
        User user = User.builder().id(1L).name("User1").email("user1@test.com").role(UserRole.EQUIPMENT_MANAGER).unit("Lab1").build();
        when(userService.createUser(Mockito.any(), Mockito.any())).thenReturn(user);
        mockMvc.perform(post("/api/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"User1\",\"email\":\"user1@test.com\",\"role\":\"EQUIPMENT_MANAGER\",\"unit\":\"Lab1\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("User1"));
    }

    @Test
    @WithMockUser(roles = {"BIOREN_ADMIN"})
    void updateUserAsAdminShouldReturnOk() throws Exception {
        User user = User.builder().id(1L).name("Updated").email("user1@test.com").role(UserRole.EQUIPMENT_MANAGER).unit("Lab1").build();
        when(userService.updateUser(Mockito.eq(1L), Mockito.any(), Mockito.any())).thenReturn(user);
        mockMvc.perform(put("/api/users/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"Updated\",\"email\":\"user1@test.com\",\"role\":\"EQUIPMENT_MANAGER\",\"unit\":\"Lab1\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated"));
    }

    @Test
    @WithMockUser(roles = {"BIOREN_ADMIN"})
    void deleteUserAsAdminShouldReturnOk() throws Exception {
        Mockito.doNothing().when(userService).deleteUser(Mockito.eq(1L), Mockito.any());
        mockMvc.perform(delete("/api/users/1")).andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = {"UNIT_MANAGER"})
    void unitManagerCannotCreateUserInOtherUnit() throws Exception {
        Mockito.doThrow(new org.springframework.security.access.AccessDeniedException("Forbidden")).when(userService).createUser(Mockito.any(), Mockito.any());
        mockMvc.perform(post("/api/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"User2\",\"email\":\"user2@test.com\",\"role\":\"EQUIPMENT_MANAGER\",\"unit\":\"Lab2\"}"))
                .andExpect(status().isForbidden());
    }
} 