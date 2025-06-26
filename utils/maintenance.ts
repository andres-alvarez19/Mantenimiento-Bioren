// utils/maintenance.ts

import { Equipment, MaintenanceFrequencyUnit } from "../types";
import { isValid } from 'date-fns'; // Importamos 'isValid' desde date-fns

export const calculateMaintenanceDetails = (equipment: Equipment): Equipment & { status: 'OK' | 'Advertencia' | 'Vencido', nextMaintenanceDate: string } => {
    let status: 'OK' | 'Advertencia' | 'Vencido' = 'OK';
    let nextMaintenanceDateStr = 'N/D';

    if (equipment.lastMaintenanceDate && equipment.maintenanceFrequency?.value && equipment.maintenanceFrequency?.unit) {

        const calculationDate = new Date(equipment.lastMaintenanceDate + 'T00:00:00');

        if (!isValid(calculationDate)) { // Verificación inicial
            return { ...equipment, status: 'OK', nextMaintenanceDate: 'N/D' };
        }

        const { value, unit } = equipment.maintenanceFrequency;

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

        // --- VERIFICACIÓN FINAL Y CORRECCIÓN ---
        // Solo si la fecha calculada es válida, la convertimos a texto.
        if (isValid(nextMaintenanceDate)) {
            nextMaintenanceDateStr = nextMaintenanceDate.toISOString();

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const oneMonthFromNow = new Date();
            oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);

            if (nextMaintenanceDate < today) status = 'Vencido';
            else if (nextMaintenanceDate < oneMonthFromNow) status = 'Advertencia';
            else status = 'OK';
        } else {
            // Si por alguna razón el cálculo produce una fecha inválida, nos aseguramos de devolver 'N/D'.
            nextMaintenanceDateStr = 'N/D';
            status = 'OK';
        }
    }

    return { ...equipment, status, nextMaintenanceDate: nextMaintenanceDateStr };
};

// --- AÑADE ESTA NUEVA FUNCIÓN ---
// Esta función tomará los datos "planos" de la API y los convertirá
// a la estructura de "Equipment" que usa nuestro frontend.
export const transformApiDataToEquipment = (apiData: any): Equipment => {
    const {
        maintenanceFrequencyValue,
        maintenanceFrequencyUnit,
        ...restOfData
    } = apiData;

    return {
        ...restOfData,
        maintenanceFrequency: {
            value: maintenanceFrequencyValue,
            unit: maintenanceFrequencyUnit,
        },
    };
};