package cl.ufro.bioren_backend.service;

import cl.ufro.bioren_backend.model.Equipment;
import cl.ufro.bioren_backend.model.IssueReport;
import cl.ufro.bioren_backend.model.User;
import cl.ufro.bioren_backend.model.UserRole;
import cl.ufro.bioren_backend.repository.EquipmentRepository;
import cl.ufro.bioren_backend.repository.IssueReportRepository;
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

class IssueReportServiceTest {
    @Mock
    private IssueReportRepository issueReportRepository;
    @Mock
    private EquipmentRepository equipmentRepository;
    @InjectMocks
    private IssueReportService issueReportService;
    private User admin;
    private User unitManager;
    private User equipmentManager;
    private Equipment equipmentLab1;
    private Equipment equipmentLab2;
    private IssueReport issueLab1;
    private IssueReport issueLab2;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        admin = User.builder().id(1L).name("Admin").email("admin@test.com").role(UserRole.BIOREN_ADMIN).build();
        unitManager = User.builder().id(2L).name("Manager").email("manager@test.com").role(UserRole.UNIT_MANAGER).unit("Lab1").build();
        equipmentManager = User.builder().id(3L).name("Encargado").email("encargado@test.com").role(UserRole.EQUIPMENT_MANAGER).unit("Lab1").build();
        equipmentLab1 = Equipment.builder().id(10L).name("Microscope").locationUnit("Lab1").build();
        equipmentLab2 = Equipment.builder().id(11L).name("Spectrometer").locationUnit("Lab2").build();
        issueLab1 = IssueReport.builder().id(100L).equipment(equipmentLab1).build();
        issueLab2 = IssueReport.builder().id(101L).equipment(equipmentLab2).build();
    }

    @Test
    void adminCanGetAllIssues() {
        when(issueReportRepository.findAll()).thenReturn(Arrays.asList(issueLab1, issueLab2));
        List<IssueReport> result = issueReportService.getAll(admin);
        assertEquals(2, result.size());
    }

    @Test
    void unitManagerCanGetIssuesOfTheirUnit() {
        when(issueReportRepository.findAll()).thenReturn(Arrays.asList(issueLab1, issueLab2));
        List<IssueReport> result = issueReportService.getAll(unitManager);
        assertEquals(1, result.size());
        assertEquals("Lab1", result.get(0).getEquipment().getLocationUnit());
    }

    @Test
    void equipmentManagerCanGetIssuesOfTheirUnit() {
        when(issueReportRepository.findAll()).thenReturn(Arrays.asList(issueLab1, issueLab2));
        List<IssueReport> result = issueReportService.getAll(equipmentManager);
        assertEquals(1, result.size());
        assertEquals("Lab1", result.get(0).getEquipment().getLocationUnit());
    }

    @Test
    void adminCanCreateIssue() {
        when(equipmentRepository.findById(10L)).thenReturn(Optional.of(equipmentLab1));
        when(issueReportRepository.save(any(IssueReport.class))).thenReturn(issueLab1);
        IssueReport created = issueReportService.create(issueLab1, admin);
        assertEquals(issueLab1.getId(), created.getId());
    }

    @Test
    void unitManagerCanCreateIssueInTheirUnit() {
        when(equipmentRepository.findById(10L)).thenReturn(Optional.of(equipmentLab1));
        when(issueReportRepository.save(any(IssueReport.class))).thenReturn(issueLab1);
        IssueReport created = issueReportService.create(issueLab1, unitManager);
        assertEquals(issueLab1.getId(), created.getId());
    }

    @Test
    void unitManagerCannotCreateIssueInOtherUnit() {
        when(equipmentRepository.findById(11L)).thenReturn(Optional.of(equipmentLab2));
        assertThrows(AccessDeniedException.class, () -> issueReportService.create(issueLab2, unitManager));
    }

    @Test
    void equipmentManagerCanCreateIssueInTheirUnit() {
        when(equipmentRepository.findById(10L)).thenReturn(Optional.of(equipmentLab1));
        when(issueReportRepository.save(any(IssueReport.class))).thenReturn(issueLab1);
        IssueReport created = issueReportService.create(issueLab1, equipmentManager);
        assertEquals(issueLab1.getId(), created.getId());
    }

    @Test
    void adminCanUpdateIssue() {
        when(issueReportRepository.findById(100L)).thenReturn(Optional.of(issueLab1));
        when(issueReportRepository.save(any(IssueReport.class))).thenReturn(issueLab1);
        IssueReport updated = IssueReport.builder().id(100L).equipment(equipmentLab1).build();
        IssueReport result = issueReportService.update(100L, updated, admin);
        assertEquals(100L, result.getId());
    }

    @Test
    void unitManagerCanUpdateIssueInTheirUnit() {
        when(issueReportRepository.findById(100L)).thenReturn(Optional.of(issueLab1));
        when(issueReportRepository.save(any(IssueReport.class))).thenReturn(issueLab1);
        IssueReport updated = IssueReport.builder().id(100L).equipment(equipmentLab1).build();
        IssueReport result = issueReportService.update(100L, updated, unitManager);
        assertEquals(100L, result.getId());
    }

    @Test
    void unitManagerCannotUpdateIssueInOtherUnit() {
        when(issueReportRepository.findById(101L)).thenReturn(Optional.of(issueLab2));
        IssueReport updated = IssueReport.builder().id(101L).equipment(equipmentLab2).build();
        assertThrows(AccessDeniedException.class, () -> issueReportService.update(101L, updated, unitManager));
    }

    @Test
    void adminCanDeleteIssue() {
        when(issueReportRepository.findById(100L)).thenReturn(Optional.of(issueLab1));
        assertDoesNotThrow(() -> issueReportService.delete(100L, admin));
        verify(issueReportRepository, times(1)).deleteById(100L);
    }

    @Test
    void unitManagerCanDeleteIssueInTheirUnit() {
        when(issueReportRepository.findById(100L)).thenReturn(Optional.of(issueLab1));
        assertDoesNotThrow(() -> issueReportService.delete(100L, unitManager));
        verify(issueReportRepository, times(1)).deleteById(100L);
    }

    @Test
    void unitManagerCannotDeleteIssueInOtherUnit() {
        when(issueReportRepository.findById(101L)).thenReturn(Optional.of(issueLab2));
        assertThrows(AccessDeniedException.class, () -> issueReportService.delete(101L, unitManager));
    }
} 