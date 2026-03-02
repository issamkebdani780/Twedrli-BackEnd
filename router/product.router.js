import { Router } from "express";
import pool from "../database.js";
const productrouter = Router();

productrouter.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM products ORDER BY date DESC;');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

productrouter.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const query = `
            SELECT p.*, u.name as owner_name, u.email as owner_email 
            FROM products p 
            JOIN users u ON p.user_id = u.id 
            WHERE p.id = ?;
        `;
        const [rows] = await pool.query(query, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json(rows[0]);
    } catch (err) {
        console.error('Error fetching product:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

productrouter.post('/', async (req, res) => {
    const { title, description, category, location, status, user_id, found_by } = req.body;
    try {
        const [result] = await pool.query(
            'INSERT INTO products (title, description, category, location, status, user_id, found_by) VALUES (?, ?, ?, ?, ?, ?, ?);', 
            [title, description, category, location, status || 'lost', user_id, found_by || null]
        );
        res.status(201).json({ message: "Product reported", id: result.insertId });
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
});

productrouter.delete('/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM products WHERE id = ?;', [req.params.id]);
        res.json({ message: "Product deleted" });
    } catch(err) {
        res.status(500).json({ error: "Delete failed" });
    }
});

productrouter.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { title, description, category, location, status, found_by } = req.body;

    try {
        const sql = `
            UPDATE products 
            SET 
                title = COALESCE(?, title), 
                description = COALESCE(?, description), 
                category = COALESCE(?, category), 
                location = COALESCE(?, location), 
                status = COALESCE(?, status),
                found_by = COALESCE(?, found_by)
            WHERE id = ?;
        `;

        const [result] = await pool.query(sql, [
            title || null, 
            description || null, 
            category || null, 
            location || null, 
            status || null, 
            found_by || null, 
            id
        ]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Product not found or no changes made' });
        }

        res.json({ message: "Product updated successfully" });
    } catch (err) {
        console.error('Error updating product:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default productrouter;