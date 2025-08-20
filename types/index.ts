import React from 'react';

export enum UserRole {
  UNIT_MANAGER = 'UNIT_MANAGER',
  BIOREN_ADMIN = 'BIOREN_ADMIN',
  EQUIPMENT_MANAGER = 'EQUIPMENT_MANAGER',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  unit?: string; // For Unit Managers
}

// EquipmentSize enum is removed

export enum EquipmentCriticality {
  LOW = 'Baja',
  MEDIUM = 'Media',
  HIGH = 'Alta',
}

export enum MaintenanceFrequencyUnit {
  DAYS = 'Días',
  WEEKS = 'Semanas',
  MONTHS = 'Meses',
  YEARS = 'Años',
}

export interface CustomMaintenanceFrequency {
  value: number;
  unit: MaintenanceFrequencyUnit;
}

export interface MaintenanceRecord {
  id: string;
  date: string; // ISO string
  description: string;
  performedBy: string;
  attachments: { name: string; url: string }[]; // Simulated PDF attachments
}

export interface Equipment {
  id: string; // Unique institutional ID
  institutionalId?: string; // Nuevo campo para el id institucional real
  name: string;
  brand: string;
  model: string;
  locationBuilding: string;
  locationUnit: string; // Responsible unit
  lastCalibrationDate?: string; // ISO string
  lastMaintenanceDate?: string; // ISO string
  encargado?: User; // Ahora es un usuario
  maintenanceFrequency: {
    value: number;
    unit: MaintenanceFrequencyUnit;
  };
  maintenanceRecords: MaintenanceRecord[];
  customMaintenanceInstructions?: string; // E.g., "Change filament every 3 months"
  // size: EquipmentSize; // Removed
  criticality: EquipmentCriticality;
  status?: 'OK' | 'Advertencia' | 'Vencido'; // Calculated status
  nextMaintenanceDate?: string; // Calculated
  purchasedByGovernment?: boolean; // New field
}

export enum IssueSeverity {
  MINOR = 'Menor',
  MODERATE = 'Moderada',
  CRITICAL = 'Crítica',
}

export interface IssueReport {
  id: string;
  equipmentId: string;
  equipmentName: string;
  reportedBy: string; // User name or ID
  dateTime: string; // ISO string
  description: string;
  severity: IssueSeverity;
  attachments: { name: string; url: string }[]; // Simulated image/PDF attachments
  status: 'Abierto' | 'En Progreso' | 'Resuelto';
}

export interface AppNotification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  message: string;
  details?: string; // e.g., equipment name, ID, deadline
  link?: string; // Direct link to scheduling system (simulated)
  timestamp: string; // ISO string
  isRead: boolean;
}

export interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  allowedRoles: UserRole[];
}

export interface ChartDataPoint {
  name: string;
  value: number;
}
