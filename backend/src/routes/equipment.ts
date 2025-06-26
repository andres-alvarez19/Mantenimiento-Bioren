import { Router } from 'express';
import pool from '../db';
import { Equipment } from '../types'; // Usamos los tipos compartidos

const router = Router();

// GET /api/equipment - Devuelve todos los equipos
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM equipment");
        res.json(rows);
    } catch (error) {
        console.error("Error al obtener equipos:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
});

// Aquí añadiremos más rutas en el futuro (GET por ID, POST, PUT, DELETE...)

export default router;