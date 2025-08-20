
import { UserRole, EquipmentCriticality, MaintenanceFrequencyUnit, Equipment, User, IssueReport, IssueSeverity, AppNotification, NavItem } from '../../types';
import { HomeIcon, CogIcon, ExclamationTriangleIcon as SolidExclamationTriangleIcon, UserGroupIcon, DocumentChartBarIcon, ShieldExclamationIcon, WrenchScrewdriverIcon, PlusCircleIcon } from '@heroicons/react/24/solid';
import React from 'react';

export const APP_NAME = "Gestor de Equipos BIOREN";

export const NAVIGATION_ITEMS: NavItem[] = [
  { path: '/', label: 'Panel Principal', icon: React.createElement(HomeIcon, { className: "w-5 h-5" }), allowedRoles: [UserRole.BIOREN_ADMIN, UserRole.UNIT_MANAGER, UserRole.EQUIPMENT_MANAGER] },
  { path: '/equipment', label: 'Equipos', icon: React.createElement(WrenchScrewdriverIcon, { className: "w-5 h-5" }), allowedRoles: [UserRole.BIOREN_ADMIN, UserRole.UNIT_MANAGER, UserRole.EQUIPMENT_MANAGER] },
  { path: '/equipment/new', label: 'Añadir Equipo', icon: React.createElement(PlusCircleIcon, { className: "w-5 h-5" }), allowedRoles: [UserRole.BIOREN_ADMIN, UserRole.UNIT_MANAGER] },
  { path: '/issues', label: 'Incidencias Reportadas', icon: React.createElement(SolidExclamationTriangleIcon, { className: "w-5 h-5" }), allowedRoles: [UserRole.BIOREN_ADMIN, UserRole.UNIT_MANAGER, UserRole.EQUIPMENT_MANAGER] },
  { path: '/reports', label: 'Informes', icon: React.createElement(DocumentChartBarIcon, { className: "w-5 h-5" }), allowedRoles: [UserRole.BIOREN_ADMIN, UserRole.UNIT_MANAGER] },
  { path: '/admin/users', label: 'Gestión de Usuarios', icon: React.createElement(UserGroupIcon, { className: "w-5 h-5" }), allowedRoles: [UserRole.BIOREN_ADMIN, UserRole.UNIT_MANAGER] },
  { path: '/admin/settings', label: 'Configuración del Sistema', icon: React.createElement(CogIcon, { className: "w-5 h-5" }), allowedRoles: [UserRole.BIOREN_ADMIN] },
];

export const QUICK_ISSUE_REPORT_PATH = '/issues/new';


// Opciones para selects con value en inglés (enum) y label en español
export const MAINTENANCE_FREQUENCY_UNITS_OPTIONS = [
  { value: 'DAYS', label: 'Días' },
  { value: 'WEEKS', label: 'Semanas' },
  { value: 'MONTHS', label: 'Meses' },
  { value: 'YEARS', label: 'Años' }
];

export const EQUIPMENT_CRITICALITY_OPTIONS = [
  { value: 'LOW', label: 'Baja' },
  { value: 'MEDIUM', label: 'Media' },
  { value: 'HIGH', label: 'Alta' }
];

export const ISSUE_SEVERITY_OPTIONS = [
  { value: 'MINOR', label: 'Menor' },
  { value: 'MODERATE', label: 'Moderada' },
  { value: 'CRITICAL', label: 'Crítica' }
];
