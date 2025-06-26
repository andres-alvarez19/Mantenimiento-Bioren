import { MaintenanceFrequencyUnit } from "../types.ts";
import {Equipment} from "@/types.ts";

export const calculateMaintenanceDetails = (equipment: Equipment): Equipment & { status: 'OK' | 'Advertencia' | 'Vencido', nextMaintenanceDate: string } => {
    let status: 'OK' | 'Advertencia' | 'Vencido' = 'OK';
    let nextMaintenanceDateStr = 'N/D';

    if (equipment.lastMaintenanceDate && equipment.maintenanceFrequency) {
        const calculationDate = new Date(equipment.lastMaintenanceDate);
        const { value, unit } = equipment.maintenanceFrequency;

        const monthsToAdd: { [key in MaintenanceFrequencyUnit]?: number } = {
            [MaintenanceFrequencyUnit.DAYS]: value / 30,
            [MaintenanceFrequencyUnit.WEEKS]: value / 4,
            [MaintenanceFrequencyUnit.MONTHS]: value,
            [MaintenanceFrequencyUnit.YEARS]: value * 12,
        };

        calculationDate.setMonth(calculationDate.getMonth() + (monthsToAdd[unit] || 0));

        const nextMaintenanceDate = calculationDate;
        nextMaintenanceDateStr = nextMaintenanceDate.toISOString();

        const today = new Date();
        const oneMonthFromNow = new Date(new Date().setMonth(today.getMonth() + 1));

        if (nextMaintenanceDate < today) status = 'Vencido';
        else if (nextMaintenanceDate < oneMonthFromNow) status = 'Advertencia';
        else status = 'OK';
    }
    return { ...equipment, status, nextMaintenanceDate: nextMaintenanceDateStr };
};