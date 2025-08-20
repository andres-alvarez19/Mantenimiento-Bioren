// utils/maintenance.ts

import { Equipment, MaintenanceFrequencyUnit } from "../../types";
import { isValid } from 'date-fns';

export const calculateMaintenanceDetails = (equipment: Equipment): Equipment & { status: 'OK' | 'Advertencia' | 'Vencido', nextMaintenanceDate: string } => {
    console.log("Calculando detalles para el equipo:", equipment);
    console.log("Valor de lastMaintenanceDate recibido:", equipment.lastMaintenanceDate);

    let status: 'OK' | 'Advertencia' | 'Vencido' = 'OK';
    let nextMaintenanceDateStr = 'N/D';

    if (equipment.lastMaintenanceDate && equipment.maintenanceFrequency?.value && equipment.maintenanceFrequency?.unit) {
        console.log("¡La condición IF se cumplió! Entrando a calcular la fecha.");
        const calculationDate = new Date(equipment.lastMaintenanceDate); // Ya no es necesario añadir T00:00:00 porque la fecha ya viene en formato ISO

        if (!isValid(calculationDate)) {
            const result = { ...equipment, status: 'OK', nextMaintenanceDate: 'N/D' };
            console.log("Fecha inicial inválida, devolviendo:", result);
            return result;
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
            nextMaintenanceDateStr = 'N/D';
            status = 'OK';
        }
    }

    // --- AÑADIMOS ESTE CONSOLE.LOG FINAL ---
    const finalResult = { ...equipment, status, nextMaintenanceDate: nextMaintenanceDateStr };
    console.log("Resultado final del cálculo:", finalResult);
    return finalResult;
    // --- FIN DEL CONSOLE.LOG FINAL ---
};


export const transformApiDataToEquipment = (apiData: any): Equipment => {
    // Soportar ambos formatos: antiguo y nuevo
    let maintenanceFrequency;
    if (apiData.maintenanceFrequency && typeof apiData.maintenanceFrequency === 'object') {
        maintenanceFrequency = apiData.maintenanceFrequency;
    } else {
        maintenanceFrequency = {
            value: apiData.maintenanceFrequencyValue,
            unit: apiData.maintenanceFrequencyUnit,
        };
    }
    return {
        ...apiData,
        maintenanceFrequency,
    };
};

