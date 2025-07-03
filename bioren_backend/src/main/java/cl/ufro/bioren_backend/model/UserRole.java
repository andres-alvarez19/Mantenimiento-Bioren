package cl.ufro.bioren_backend.model;

/**
 * Enum que representa los roles de usuario en el sistema.
 */
public enum UserRole {
    /** Administrador BIOREN: acceso total al sistema. */
    BIOREN_ADMIN,
    /** Jefe de Unidad: gestiona equipos e incidencias de su unidad. */
    UNIT_MANAGER,
    /** Encargado de Equipo: acceso restringido a su unidad. */
    EQUIPMENT_MANAGER
} 