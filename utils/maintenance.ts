// MantenimientoBioren/utils/maintenance.ts

import { Equipment, MaintenanceFrequencyUnit } from "../types";

export const calculateMaintenanceDetails = (equipment: Equipment): Equipment & { status: 'OK' | 'Advertencia' | 'Vencido', nextMaintenanceDate: string } => {
    let status: 'OK' | 'Advertencia' | 'Vencido' = 'OK';
    let nextMaintenanceDateStr = 'N/D';

    // Solo calculamos si tenemos los datos necesarios
    if (equipment.lastMaintenanceDate && equipment.maintenanceFrequency?.value && equipment.maintenanceFrequency?.unit) {
        // Creamos una fecha base. Es importante agregar 'T00:00:00' para evitar problemas de zona horaria.
        const calculationDate = new Date(equipment.lastMaintenanceDate + 'T00:00:00');
        const { value, unit } = equipment.maintenanceFrequency;

        // --- LÓGICA CORREGIDA ---
        switch (unit) {
            case MaintenanceFrequencyUnit.DAYS:
                calculationDate.setDate(calculationDate.getDate() + value);
                break;
            case MaintenanceFrequencyUnit.WEEKS:
                calculationDate.setDate(calculationDate.getDate() + value * 7);
                break;
            case MaintenanceFrequencyUnit.MONTHS:
                calculationDate.setMonth(calculationDate.getMonth() + value);
                break;
            case MaintenanceFrequencyUnit.YEARS:
                calculationDate.setFullYear(calculationDate.getFullYear() + value);
                break;
        }

        const nextMaintenanceDate = calculationDate;
        nextMaintenanceDateStr = nextMaintenanceDate.toISOString();

        // El resto de la lógica de comparación de fechas permanece igual
        const today = new Date();
        // Ponemos la hora a cero para comparar solo los días
        today.setHours(0, 0, 0, 0);

        const oneMonthFromNow = new Date();
        oneMonthFromNow.setMonth(today.getMonth() + 1);

        if (nextMaintenanceDate < today) status = 'Vencido';
        else if (nextMaintenanceDate < oneMonthFromNow) status = 'Advertencia';
        else status = 'OK';
    }

    return { ...equipment, status, nextMaintenanceDate: nextMaintenanceDateStr };
};