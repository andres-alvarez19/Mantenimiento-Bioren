// backend/src/routes/equipment.ts

import { Router, Request, Response } from 'express';
import pool from '../db';
import { Equipment } from '../types';

const router = Router();

// GET /api/equipment - Devuelve todos los equipos
router.get('/', async (req: Request, res: Response) => {
    try {
        const [rows] = await pool.query("SELECT * FROM equipment");
        return res.json(rows);
    } catch (error) {
        console.error("Error al obtener equipos:", error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
});

// --- CÓDIGO AÑADIDO ---
// GET /api/equipment/:id - Devuelve un solo equipo por su ID
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params; // Obtenemos el ID de la URL (ej: /api/equipment/1010)
        const [rows] = await pool.query("SELECT * FROM equipment WHERE id = ?", [id]);

        const equipmentList = rows as any[];
        if (equipmentList.length === 0) {
            // Si la consulta no devuelve resultados, enviamos un error 404
            return res.status(404).json({ message: "Equipo no encontrado" });
        }

        // Devolvemos el primer (y único) resultado del array
        return res.json(equipmentList[0]);

    } catch (error) {
        console.error(`Error al obtener el equipo ${req.params.id}:`, error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
});
// --- FIN DEL CÓDIGO AÑADIDO ---


// POST /api/equipment - Crea un nuevo equipo
router.post('/', async (req: Request, res: Response) => {
    try {
        const newEquipment: Equipment = req.body;

        // 1. Validación de los datos recibidos
        if (!newEquipment || !newEquipment.id || !newEquipment.name) {
            return res.status(400).json({ message: 'Faltan campos requeridos (id, name).' });
        }

        // 2. Definimos la consulta SQL de forma clara
        const sqlQuery = `
            INSERT INTO equipment 
            (id, name, brand, model, locationBuilding, locationUnit, lastCalibrationDate, lastMaintenanceDate, encargado, maintenanceFrequencyValue, maintenanceFrequencyUnit, customMaintenanceInstructions, criticality) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        // 3. Creamos un array con los valores en el orden correcto
        const values = [
            newEquipment.id,
            newEquipment.name,
            newEquipment.brand || null,
            newEquipment.model || null,
            newEquipment.locationBuilding || null,
            newEquipment.locationUnit || null,
            newEquipment.lastCalibrationDate || null,
            newEquipment.lastMaintenanceDate || null,
            newEquipment.encargado || null,
            newEquipment.maintenanceFrequency?.value || null,
            newEquipment.maintenanceFrequency?.unit || null,
            newEquipment.customMaintenanceInstructions || null,
            newEquipment.criticality || null
        ];

        // 4. Ejecutamos la consulta con los valores
        await pool.query(sqlQuery, values);

        // 5. Respondemos con éxito
        return res.status(201).json({ message: 'Equipo creado exitosamente' });

    } catch (error) {
        // Manejo de errores
        console.error("Error al crear el equipo:", error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
});

// Asegurarnos de que la exportación por defecto está al final
export default router;