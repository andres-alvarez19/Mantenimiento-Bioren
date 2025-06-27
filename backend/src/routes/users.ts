// backend/src/routes/users.ts

import { Router, Request, Response } from 'express';
import pool from '../db';
import { User } from '../types'; // Usamos el tipo compartido

const router = Router();

// GET /api/users - Devuelve todos los usuarios
router.get('/', async (req: Request, res: Response) => {
    try {
        const [rows] = await pool.query("SELECT id, name, email, role, unit FROM users ORDER BY name ASC");
        res.json(rows);
    } catch (error) {
        console.error("Error al obtener usuarios:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
});

// POST /api/users - Crea un nuevo usuario
router.post('/', async (req: Request, res: Response) => {
    try {
        const newUser: User = req.body;
        if (!newUser || !newUser.name || !newUser.email || !newUser.role) {
            return res.status(400).json({ message: 'Faltan campos requeridos.' });
        }

        const userId = `user-${Date.now()}`;
        const sql = `INSERT INTO users (id, name, email, role, unit) VALUES (?, ?, ?, ?, ?)`;
        const values = [userId, newUser.name, newUser.email, newUser.role, newUser.unit || null];

        await pool.query(sql, values);
        res.status(201).json({ message: 'Usuario creado exitosamente', newUserId: userId });
    } catch (error) {
        console.error("Error al crear el usuario:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
});

// PUT /api/users/:id - Actualiza un usuario
router.put('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updatedUser: User = req.body;
        if (!updatedUser || !updatedUser.name || !updatedUser.email || !updatedUser.role) {
            return res.status(400).json({ message: 'Faltan campos requeridos.' });
        }

        const sql = `UPDATE users SET name = ?, email = ?, role = ?, unit = ? WHERE id = ?`;
        const values = [updatedUser.name, updatedUser.email, updatedUser.role, updatedUser.unit || null, id];

        const [result] = await pool.query(sql, values);
        const apacket = result as any;
        if (apacket.affectedRows === 0) {
            return res.status(404).json({ message: "Usuario no encontrado para actualizar." });
        }
        res.status(200).json({ message: 'Usuario actualizado exitosamente' });
    } catch (error) {
        console.error("Error al actualizar el usuario:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
});

// DELETE /api/users/:id - Elimina un usuario
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const [result] = await pool.query("DELETE FROM users WHERE id = ?", [id]);
        const apacket = result as any;
        if (apacket.affectedRows === 0) {
            return res.status(404).json({ message: "Usuario no encontrado para eliminar." });
        }
        res.status(200).json({ message: 'Usuario eliminado exitosamente' });
    } catch (error) {
        console.error("Error al eliminar el usuario:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
});

export default router;