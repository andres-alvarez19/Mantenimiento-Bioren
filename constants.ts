
import { UserRole, EquipmentCriticality, MaintenanceFrequencyUnit, Equipment, User, IssueReport, IssueSeverity, AppNotification, NavItem } from './types';
import { HomeIcon, CogIcon, ExclamationTriangleIcon as SolidExclamationTriangleIcon, UserGroupIcon, DocumentChartBarIcon, ShieldExclamationIcon, WrenchScrewdriverIcon, PlusCircleIcon } from '@heroicons/react/24/solid';
import React from 'react';

export const APP_NAME = "Gestor de Equipos BIOREN";

export const MOCK_USERS: User[] = [
  { id: 'user1', name: 'Dr. Eva Corell', email: 'eva.corell@bioren.edu', role: UserRole.UNIT_MANAGER, unit: 'Genomics Unit' },
  { id: 'user2', name: 'Admin BioRen', email: 'admin@bioren.edu', role: UserRole.BIOREN_ADMIN },
  { id: 'user3', name: 'Researcher Bio', email: 'researcher.bio@bioren.edu', role: UserRole.READ_ONLY },
  { id: 'user4', name: 'Dr. Alan Grant', email: 'alan.grant@bioren.edu', role: UserRole.UNIT_MANAGER, unit: 'Paleontology Unit' },
];

export const MOCK_EQUIPMENT: Equipment[] = [
  {
    id: 'BIOREN-SEQ-001',
    name: 'DNA Sequencer Alpha',
    brand: 'Illumina',
    model: 'NovaSeq 6000',
    locationBuilding: 'Edificio A',
    locationUnit: 'Genomics Unit',
    lastMaintenanceDate: '2024-03-15T10:00:00Z',
    encargado: 'Equipo Técnico A', // Changed from assignedTechnician
    maintenanceFrequency: { value: 6, unit: MaintenanceFrequencyUnit.MONTHS },
    maintenanceRecords: [
      { id: 'mr-001', date: '2024-03-15T10:00:00Z', description: 'Calibración anual y revisión de ópticas.', performedBy: 'Equipo Técnico A', attachments: [{ name: 'registro_20240315.pdf', url: '#' }] }
    ],
    customMaintenanceInstructions: 'Revisar celda de flujo semanalmente. Reemplazar módulo láser anualmente.',
    // size: EquipmentSize.LARGE, // Removed
    criticality: EquipmentCriticality.HIGH,
  },
  {
    id: 'BIOREN-MIC-002',
    name: 'Confocal Microscope Zeta',
    brand: 'Zeiss',
    model: 'LSM 980',
    locationBuilding: 'Edificio B',
    locationUnit: 'Microscopy Core',
    lastMaintenanceDate: '2024-06-01T14:30:00Z',
    encargado: 'Equipo Técnico B', // Changed from assignedTechnician
    maintenanceFrequency: { value: 3, unit: MaintenanceFrequencyUnit.MONTHS },
    maintenanceRecords: [
       { id: 'mr-002', date: '2024-06-01T14:30:00Z', description: 'Alineación trimestral del láser.', performedBy: 'Equipo Técnico B', attachments: [{ name: 'registro_20240601.pdf', url: '#' }] }
    ],
    // size: EquipmentSize.MEDIUM, // Removed
    criticality: EquipmentCriticality.MEDIUM,
  },
  {
    id: 'BIOREN-CEN-003',
    name: 'High-Speed Centrifuge',
    brand: 'Beckman Coulter',
    model: 'Optima XPN',
    locationBuilding: 'Edificio A',
    locationUnit: 'Genomics Unit',
    lastMaintenanceDate: '2023-11-20T09:00:00Z', 
    encargado: 'Equipo Técnico A', // Changed from assignedTechnician
    maintenanceFrequency: { value: 1, unit: MaintenanceFrequencyUnit.YEARS },
    maintenanceRecords: [],
    // size: EquipmentSize.MEDIUM, // Removed
    criticality: EquipmentCriticality.HIGH,
  },
  {
    id: 'BIOREN-PCR-004',
    name: 'Real-Time PCR Cycler',
    brand: 'Bio-Rad',
    model: 'CFX96',
    locationBuilding: 'Edificio C',
    locationUnit: 'Laboratorio de Biología Molecular',
    lastMaintenanceDate: '2024-07-01T11:00:00Z',
    encargado: 'Equipo Técnico C', // Changed from assignedTechnician
    maintenanceFrequency: { value: 6, unit: MaintenanceFrequencyUnit.MONTHS },
    maintenanceRecords: [],
    // size: EquipmentSize.SMALL, // Removed
    criticality: EquipmentCriticality.MEDIUM,
  },
];

export const MOCK_ISSUES: IssueReport[] = [
  {
    id: 'issue-001',
    equipmentId: 'BIOREN-SEQ-001',
    equipmentName: 'DNA Sequencer Alpha',
    reportedBy: 'Dr. Eva Corell',
    dateTime: '2024-07-15T14:00:00Z',
    description: 'Código de error E-105 mostrado, la ejecución de secuenciación falló.',
    severity: IssueSeverity.CRITICAL,
    attachments: [{name: 'captura_error.png', url: '#'}],
    status: 'Abierto',
  },
  {
    id: 'issue-002',
    equipmentId: 'BIOREN-MIC-002',
    equipmentName: 'Confocal Microscope Zeta',
    reportedBy: 'Researcher Bio',
    dateTime: '2024-07-20T09:30:00Z',
    description: 'El enfoque de la imagen es errático en alta magnificación.',
    severity: IssueSeverity.MODERATE,
    attachments: [],
    status: 'En Progreso',
  }
];

export const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-001',
    type: 'warning',
    message: 'Mantenimiento Próximo para DNA Sequencer Alpha (BIOREN-SEQ-001)',
    details: 'Próximo mantenimiento: 15/09/2024. Encargado: Equipo Técnico A.', // Updated "Responsable" to "Encargado"
    link: '#/equipment/BIOREN-SEQ-001',
    timestamp: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
    isRead: false,
  },
  {
    id: 'notif-002',
    type: 'error',
    message: 'Mantenimiento Vencido: High-Speed Centrifuge (BIOREN-CEN-003)',
    details: 'Mantenimiento debió realizarse el: 20/07/2024. Por favor, programar inmediatamente.',
    link: '#/equipment/BIOREN-CEN-003',
    timestamp: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
    isRead: false,
  },
  {
    id: 'notif-003',
    type: 'info',
    message: 'Nueva Incidencia Reportada para Confocal Microscope Zeta (BIOREN-MIC-002)',
    details: 'Severidad: Moderada. Reportado por: Researcher Bio.',
    link: '#/issues',
    timestamp: new Date().toISOString(),
    isRead: true,
  }
];

export const NAVIGATION_ITEMS: NavItem[] = [
  { path: '/', label: 'Panel Principal', icon: React.createElement(HomeIcon, { className: "w-5 h-5" }), allowedRoles: [UserRole.BIOREN_ADMIN, UserRole.UNIT_MANAGER, UserRole.ENCARGADO] },
  { path: '/equipment', label: 'Equipos', icon: React.createElement(WrenchScrewdriverIcon, { className: "w-5 h-5" }), allowedRoles: [UserRole.BIOREN_ADMIN, UserRole.UNIT_MANAGER, UserRole.ENCARGADO] },
  { path: '/equipment/new', label: 'Añadir Equipo', icon: React.createElement(PlusCircleIcon, { className: "w-5 h-5" }), allowedRoles: [UserRole.BIOREN_ADMIN, UserRole.UNIT_MANAGER] },
  { path: '/issues', label: 'Incidencias Reportadas', icon: React.createElement(SolidExclamationTriangleIcon, { className: "w-5 h-5" }), allowedRoles: [UserRole.BIOREN_ADMIN, UserRole.UNIT_MANAGER, UserRole.ENCARGADO] },
  { path: '/reports', label: 'Informes', icon: React.createElement(DocumentChartBarIcon, { className: "w-5 h-5" }), allowedRoles: [UserRole.BIOREN_ADMIN, UserRole.UNIT_MANAGER] },
  { path: '/admin/users', label: 'Gestión de Usuarios', icon: React.createElement(UserGroupIcon, { className: "w-5 h-5" }), allowedRoles: [UserRole.BIOREN_ADMIN] },
  { path: '/admin/settings', label: 'Configuración del Sistema', icon: React.createElement(CogIcon, { className: "w-5 h-5" }), allowedRoles: [UserRole.BIOREN_ADMIN] },
];

export const QUICK_ISSUE_REPORT_PATH = '/issues/new';


export const MAINTENANCE_FREQUENCY_UNITS_OPTIONS = Object.values(MaintenanceFrequencyUnit).map(unit => ({ value: unit, label: unit }));
// export const EQUIPMENT_SIZE_OPTIONS = Object.values(EquipmentSize).map(size => ({ value: size, label: size })); // Removed
export const EQUIPMENT_CRITICALITY_OPTIONS = Object.values(EquipmentCriticality).map(crit => ({ value: crit, label: crit }));
export const ISSUE_SEVERITY_OPTIONS = Object.values(IssueSeverity).map(sev => ({ value: sev, label: sev }));