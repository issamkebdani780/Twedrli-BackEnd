import { Router } from "express";
import pool from "../database.js";

const badgesRouter = Router();

const BADGE_COLUMNS = Array.from({ length: 29 }, (_, i) => `b${i + 1}`);

badgesRouter.get('/', async (req, res) => {
    try {
        const [badges] = await pool.query('SELECT * FROM badges');
        res.json(badges);
    } catch (err) {
        console.error("Error fetching badges:", err);
        res.status(500).json({ error: "Internal Server Error", message: err.message });
    }
});

badgesRouter.post('/', async (req, res) => {
    try {
        const { user_id, ...badgeFields } = req.body;

        const columns = ['user_id', ...BADGE_COLUMNS.filter(col => col in badgeFields)];
        const values = [user_id, ...BADGE_COLUMNS.filter(col => col in badgeFields).map(col => badgeFields[col] ? 1 : 0)];

        const placeholders = columns.map(() => '?').join(', ');
        const [result] = await pool.query(
            `INSERT INTO badges (${columns.join(', ')}) VALUES (${placeholders})`,
            values
        );

        res.status(201).json({ message: "Badge created successfully", id: result.insertId });
    } catch (err) {
        console.error("Error creating badge:", err);
        res.status(500).json({ error: "Internal Server Error", message: err.message });
    }
});

badgesRouter.get('/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const [rows] = await pool.query('SELECT * FROM badges WHERE user_id = ?', [userId]);
        if (rows.length === 0) {
            return res.status(404).json({ error: "Badge not found for the specified user ID" });
        }
        res.json(rows[0]);
    } catch (err) {
        console.error("Error fetching badge by user ID:", err);
        res.status(500).json({ error: "Internal Server Error", message: err.message });
    }
});

badgesRouter.put('/:id', async (req, res) => {
    try {
        const badgeId = req.params.id;
        const updates = Object.entries(req.body)
            .filter(([col]) => BADGE_COLUMNS.includes(col));

        if (updates.length === 0) {
            return res.status(400).json({ error: "No valid badge columns provided" });
        }

        const setClause = updates.map(([col]) => `${col} = ?`).join(', ');
        const values = [...updates.map(([, val]) => val ? 1 : 0), badgeId];

        const [result] = await pool.query(
            `UPDATE badges SET ${setClause} WHERE id = ?`,
            values
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Badge not found" });
        }

        res.json({ message: "Badge updated successfully" });
    } catch (err) {
        console.error("Error updating badge:", err);
        res.status(500).json({ error: "Internal Server Error", message: err.message });
    }
});

badgesRouter.delete('/:id', async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM badges WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Badge not found" });
        }
        res.json({ message: "Badge deleted successfully" });
    } catch (err) {
        console.error("Error deleting badge:", err);
        res.status(500).json({ error: "Internal Server Error", message: err.message });
    }
});

export default badgesRouter;