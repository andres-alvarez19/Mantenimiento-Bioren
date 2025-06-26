// backend/src/routes/issues.ts

import { Router, Request, Response } from 'express';
import pool from '../db';
import { IssueReport } from '../types'; // Usamos el tipo compartido

const router = Router();

// GET /api/issues - Devuelve todas las incidencias
router.get('/', async (req: Request, res: Response) => {
    try {
        const [rows] = await pool.query("SELECT * FROM issue_reports ORDER BY dateTime DESC");
        res.json(rows);
    } catch (error) {
        console.error("Error al obtener incidencias:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
});

// POST /api/issues - Crea una nueva incidencia
router.post('/', async (req: Request, res: Response) => {
    try {
        const newIssue: IssueReport = req.body;

        // Validación de datos
        if (!newIssue || !newIssue.equipmentId || !newIssue.description || !newIssue.severity) {
            return res.status(400).json({ message: 'Faltan campos requeridos.' });
        }

        // Asignamos un nuevo ID y la fecha actual en el backend para seguridad
        const issueId = `issue-${Date.now()}`;
        const reportDate = new Date();

        const sql = `
            INSERT INTO issue_reports
                (id, equipmentId, reportedBy, dateTime, description, severity, status)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
            issueId,
            newIssue.equipmentId,
            newIssue.reportedBy, // Este vendrá del usuario logueado en el frontend
            reportDate,
            newIssue.description,
            newIssue.severity,
            'Abierto' // Todas las incidencias nuevas empiezan como 'Abierto'
        ];

        await pool.query(sql, values);
        res.status(201).json({ message: 'Incidencia reportada exitosamente' });

    } catch (error) {
        console.error("Error al reportar la incidencia:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
});

export default router;