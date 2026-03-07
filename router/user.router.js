import { Router } from "express";
import pool from "../database.js";
import bcrypt from "bcryptjs";
const userrouter = Router();

userrouter.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT id, name, email, role, department, created_at, img_url FROM users;');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

userrouter.post('/', async (req, res) => {
    const { name, email, password, role, department, img_url } = req.body;
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const [result] = await pool.query(
            'INSERT INTO users (name, email, password, role, department, img_url) VALUES (?, ?, ?, ?, ?, ?);',
            [name, email, hashedPassword, role || 'user', department, img_url]
        );
        res.status(201).json({ message: "User created", userId: result.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

userrouter.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, email, role, department, img_url } = req.body;
    try {
        await pool.query(
            'UPDATE users SET name = COALESCE(?, name), email = COALESCE(?, email), role = COALESCE(?, role), department = COALESCE(?, department),  img_url= COALESCE(?, img_url)  WHERE id = ?;',
            [name, email, role, department, img_url, id]
        );
        res.json({ message: "User updated successfully" });
    } catch (err) {
        res.status(500).json({ error: 'Update failed' });
    }
});

userrouter.get('/email/:email', async (req, res) => {
    const { email } = req.params;
    try {
        const [rows] = await pool.query(
            'SELECT id, name, email, role, department, img_url, created_at FROM users WHERE email = ?;',
            [email]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'User not found with this email' });
        }

        res.json(rows[0]);
    } catch (err) {
        console.error('Error fetching user by email:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

userrouter.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [user] = await pool.query('SELECT id FROM users WHERE id = ?;', [id]);

        if (user.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        await pool.query('DELETE FROM users WHERE id = ?;', [id]);

        res.json({
            message: "User deleted successfully",
            deletedId: id
        });
    } catch (err) {
        console.error('Error deleting user:', err);

        if (err.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(400).json({
                error: 'Cannot delete user: This user has active posts or products linked to them.'
            });
        }

        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default userrouter;