package cl.ufro.bioren_backend.service;

import cl.ufro.bioren_backend.model.Equipment;
import cl.ufro.bioren_backend.model.MaintenanceRecord;
import cl.ufro.bioren_backend.model.User;
import cl.ufro.bioren_backend.model.UserRole;
import cl.ufro.bioren_backend.repository.EquipmentRepository;
import cl.ufro.bioren_backend.repository.MaintenanceRecordRepository;
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

class MaintenanceRecordServiceTest {
    @Mock
    private MaintenanceRecordRepository maintenanceRecordRepository;
    @Mock
    private EquipmentRepository equipmentRepository;
    @InjectMocks
    private MaintenanceRecordService maintenanceRecordService;
    private User admin;
    private User unitManager;
    private User equipmentManager;
    private Equipment equipmentLab1;
    private Equipment equipmentLab2;
    private MaintenanceRecord recordLab1;
    private MaintenanceRecord recordLab2;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        admin = User.builder().id(1L).name("Admin").email("admin@test.com").role(UserRole.BIOREN_ADMIN).build();
        unitManager = User.builder().id(2L).name("Manager").email("manager@test.com").role(UserRole.UNIT_MANAGER).unit("Lab1").build();
        equipmentManager = User.builder().id(3L).name("Encargado").email("encargado@test.com").role(UserRole.EQUIPMENT_MANAGER).unit("Lab1").build();
        equipmentLab1 = Equipment.builder().id(10L).name("Microscope").locationUnit("Lab1").build();
        equipmentLab2 = Equipment.builder().id(11L).name("Spectrometer").locationUnit("Lab2").build();
        recordLab1 = MaintenanceRecord.builder().id(100L).equipment(equipmentLab1).build();
        recordLab2 = MaintenanceRecord.builder().id(101L).equipment(equipmentLab2).build();
    }

    @Test
    void adminCanGetAllRecords() {
        when(maintenanceRecordRepository.findAll()).thenReturn(Arrays.asList(recordLab1, recordLab2));
        List<MaintenanceRecord> result = maintenanceRecordService.getAll(admin);
        assertEquals(2, result.size());
    }

    @Test
    void unitManagerCanGetRecordsOfTheirUnit() {
        when(maintenanceRecordRepository.findAll()).thenReturn(Arrays.asList(recordLab1, recordLab2));
        List<MaintenanceRecord> result = maintenanceRecordService.getAll(unitManager);
        assertEquals(1, result.size());
        assertEquals("Lab1", result.get(0).getEquipment().getLocationUnit());
    }

    @Test
    void equipmentManagerCanGetRecordsOfTheirUnit() {
        when(maintenanceRecordRepository.findAll()).thenReturn(Arrays.asList(recordLab1, recordLab2));
        List<MaintenanceRecord> result = maintenanceRecordService.getAll(equipmentManager);
        assertEquals(1, result.size());
        assertEquals("Lab1", result.get(0).getEquipment().getLocationUnit());
    }

    @Test
    void adminCanCreateRecord() {
        when(equipmentRepository.findById(10L)).thenReturn(Optional.of(equipmentLab1));
        when(maintenanceRecordRepository.save(any(MaintenanceRecord.class))).thenReturn(recordLab1);
        MaintenanceRecord created = maintenanceRecordService.create(recordLab1, admin);
        assertEquals(recordLab1.getId(), created.getId());
    }

    @Test
    void unitManagerCanCreateRecordInTheirUnit() {
        when(equipmentRepository.findById(10L)).thenReturn(Optional.of(equipmentLab1));
        when(maintenanceRecordRepository.save(any(MaintenanceRecord.class))).thenReturn(recordLab1);
        MaintenanceRecord created = maintenanceRecordService.create(recordLab1, unitManager);
        assertEquals(recordLab1.getId(), created.getId());
    }

    @Test
    void unitManagerCannotCreateRecordInOtherUnit() {
        when(equipmentRepository.findById(11L)).thenReturn(Optional.of(equipmentLab2));
        assertThrows(AccessDeniedException.class, () -> maintenanceRecordService.create(recordLab2, unitManager));
    }

    @Test
    void adminCanUpdateRecord() {
        when(maintenanceRecordRepository.findById(100L)).thenReturn(Optional.of(recordLab1));
        when(maintenanceRecordRepository.save(any(MaintenanceRecord.class))).thenReturn(recordLab1);
        MaintenanceRecord updated = MaintenanceRecord.builder().id(100L).equipment(equipmentLab1).build();
        MaintenanceRecord result = maintenanceRecordService.update(100L, updated, admin);
        assertEquals(100L, result.getId());
    }

    @Test
    void unitManagerCanUpdateRecordInTheirUnit() {
        when(maintenanceRecordRepository.findById(100L)).thenReturn(Optional.of(recordLab1));
        when(maintenanceRecordRepository.save(any(MaintenanceRecord.class))).thenReturn(recordLab1);
        MaintenanceRecord updated = MaintenanceRecord.builder().id(100L).equipment(equipmentLab1).build();
        MaintenanceRecord result = maintenanceRecordService.update(100L, updated, unitManager);
        assertEquals(100L, result.getId());
    }

    @Test
    void unitManagerCannotUpdateRecordInOtherUnit() {
        when(maintenanceRecordRepository.findById(101L)).thenReturn(Optional.of(recordLab2));
        MaintenanceRecord updated = MaintenanceRecord.builder().id(101L).equipment(equipmentLab2).build();
        assertThrows(AccessDeniedException.class, () -> maintenanceRecordService.update(101L, updated, unitManager));
    }

    @Test
    void adminCanDeleteRecord() {
        when(maintenanceRecordRepository.findById(100L)).thenReturn(Optional.of(recordLab1));
        assertDoesNotThrow(() -> maintenanceRecordService.delete(100L, admin));
        verify(maintenanceRecordRepository, times(1)).deleteById(100L);
    }

    @Test
    void unitManagerCanDeleteRecordInTheirUnit() {
        when(maintenanceRecordRepository.findById(100L)).thenReturn(Optional.of(recordLab1));
        assertDoesNotThrow(() -> maintenanceRecordService.delete(100L, unitManager));
        verify(maintenanceRecordRepository, times(1)).deleteById(100L);
    }

    @Test
    void unitManagerCannotDeleteRecordInOtherUnit() {
        when(maintenanceRecordRepository.findById(101L)).thenReturn(Optional.of(recordLab2));
        assertThrows(AccessDeniedException.class, () -> maintenanceRecordService.delete(101L, unitManager));
    }
} 