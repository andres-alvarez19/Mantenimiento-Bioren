package cl.ufro.bioren_backend.service;

import cl.ufro.bioren_backend.model.Equipment;
import cl.ufro.bioren_backend.model.User;
import cl.ufro.bioren_backend.model.UserRole;
import cl.ufro.bioren_backend.repository.EquipmentRepository;
import cl.ufro.bioren_backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.access.AccessDeniedException;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for EquipmentService.
 */
class EquipmentServiceTest {
    @Mock
    private EquipmentRepository equipmentRepository;
    @Mock
    private UserRepository userRepository;
    @InjectMocks
    private EquipmentService equipmentService;

    private User admin;
    private User unitManager;
    private Equipment equipment;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        admin = User.builder().id(1L).name("Admin").email("admin@test.com").role(UserRole.BIOREN_ADMIN).build();
        unitManager = User.builder().id(2L).name("Manager").email("manager@test.com").role(UserRole.UNIT_MANAGER).unit("Lab1").build();
        equipment = Equipment.builder().id(10L).name("Microscope").locationUnit("Lab1").build();
    }

    @Test
    void adminCanGetAllEquipments() {
        when(equipmentRepository.findAll()).thenReturn(Arrays.asList(equipment));
        List<Equipment> result = equipmentService.getAllEquipments(admin);
        assertEquals(1, result.size());
    }

    @Test
    void unitManagerCanGetEquipmentsOfTheirUnit() {
        when(equipmentRepository.findByLocationUnit("Lab1")).thenReturn(Arrays.asList(equipment));
        List<Equipment> result = equipmentService.getAllEquipments(unitManager);
        assertEquals(1, result.size());
    }

    @Test
    void adminCanDeleteEquipment() {
        assertDoesNotThrow(() -> equipmentService.deleteEquipment(10L, admin));
        verify(equipmentRepository, times(1)).deleteById(10L);
    }

    @Test
    void unitManagerCannotDeleteEquipment() {
        assertThrows(AccessDeniedException.class, () -> equipmentService.deleteEquipment(10L, unitManager));
    }

    @Test
    void unitManagerCanCreateEquipmentInTheirUnit() {
        when(equipmentRepository.save(any(Equipment.class))).thenAnswer(invocation -> invocation.getArgument(0));
        Equipment created = equipmentService.createEquipment(equipment, unitManager);
        assertEquals(equipment.getName(), created.getName());
    }

    @Test
    void unitManagerCannotCreateEquipmentInOtherUnit() {
        Equipment other = Equipment.builder().id(11L).name("Other").locationUnit("Lab2").build();
        assertThrows(AccessDeniedException.class, () -> equipmentService.createEquipment(other, unitManager));
    }

    @Test
    void adminCanUpdateEquipment() {
        when(equipmentRepository.findById(10L)).thenReturn(Optional.of(equipment));
        when(equipmentRepository.save(any(Equipment.class))).thenAnswer(invocation -> invocation.getArgument(0));
        Equipment updated = Equipment.builder().id(10L).name("Updated").locationUnit("Lab1").build();
        Equipment result = equipmentService.updateEquipment(10L, updated, admin);
        assertEquals("Updated", result.getName());
    }

    @Test
    void unitManagerCanUpdateEquipmentInTheirUnit() {
        when(equipmentRepository.findById(10L)).thenReturn(Optional.of(equipment));
        when(equipmentRepository.save(any(Equipment.class))).thenAnswer(invocation -> invocation.getArgument(0));
        Equipment updated = Equipment.builder().id(10L).name("Updated").locationUnit("Lab1").build();
        Equipment result = equipmentService.updateEquipment(10L, updated, unitManager);
        assertEquals("Updated", result.getName());
    }

    @Test
    void unitManagerCannotUpdateEquipmentInOtherUnit() {
        Equipment other = Equipment.builder().id(11L).name("Other").locationUnit("Lab2").build();
        when(equipmentRepository.findById(11L)).thenReturn(Optional.of(other));
        Equipment updated = Equipment.builder().id(11L).name("Updated").locationUnit("Lab2").build();
        assertThrows(AccessDeniedException.class, () -> equipmentService.updateEquipment(11L, updated, unitManager));
    }

    @Test
    void adminCanGetEquipmentById() {
        when(equipmentRepository.findById(10L)).thenReturn(Optional.of(equipment));
        Equipment result = equipmentService.getEquipmentById(10L, admin);
        assertEquals(equipment.getName(), result.getName());
    }

    @Test
    void unitManagerCanGetEquipmentByIdInTheirUnit() {
        when(equipmentRepository.findById(10L)).thenReturn(Optional.of(equipment));
        Equipment result = equipmentService.getEquipmentById(10L, unitManager);
        assertEquals(equipment.getName(), result.getName());
    }

    @Test
    void unitManagerCannotGetEquipmentByIdInOtherUnit() {
        Equipment other = Equipment.builder().id(11L).name("Other").locationUnit("Lab2").build();
        when(equipmentRepository.findById(11L)).thenReturn(Optional.of(other));
        assertThrows(AccessDeniedException.class, () -> equipmentService.getEquipmentById(11L, unitManager));
    }

    @Test
    void adminCanCreateEquipment() {
        when(equipmentRepository.save(any(Equipment.class))).thenAnswer(invocation -> invocation.getArgument(0));
        Equipment created = equipmentService.createEquipment(equipment, admin);
        assertEquals(equipment.getName(), created.getName());
    }
} 