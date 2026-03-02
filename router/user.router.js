import { Router } from "express";
import pool from "../database.js";
const userrouter = Router();

userrouter.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM users;');
        res.json(rows);
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

userrouter.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query('SELECT * FROM users WHERE id = ?;', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(rows[0]);
    } catch (err) {
        console.error('Error fetching user:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

userrouter.post('/', async (req, res) => {
    const { name, email, avatar, role, department, status, joined } = req.body;
    try {
        const result = await pool.query('INSERT INTO users (name, email, avatar, role, department, status, joined) VALUES (?, ?, ?, ?, ?, ?, ?);', [name, email, avatar, role, department, status, joined]);
        res.status(201).json({ message: "User added successfully", result });
    } catch(err){
        console.error('Error adding user:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

userrouter.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, email, avatar, role, department, status, joined } = req.body;
    try{
        const result = await pool.query('UPDATE users SET name = ?, email = ?, avatar = ?, role = ?, department = ?, status = ?, joined = ? WHERE id = ?;', [name, email, avatar, role, department, status, joined, id]);
        res.json({ message: "User updated successfully", result });
    } catch(err){
        console.error('Error updating user:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

userrouter.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try{
        const result = await pool.query('DELETE FROM users WHERE id = ?;', [id]);
        res.json({ message: "User deleted successfully", result });
    } catch(err){
        console.error('Error deleting user:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

export default userrouter;
