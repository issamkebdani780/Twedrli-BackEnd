import { Router } from "express";
import pool from "../database.js";
const productrouter = Router();

productrouter.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM products;');
        res.json(rows);
    } catch (err) {
        console.error('Error fetching products:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

productrouter.post('/', async (req, res) => {
    const { title, description, category, location, status, date, user_id, found_by } = req.body;
    try{
        const result = await pool.query('INSERT INTO products (title, description, category, location, status, date, user_id, found_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?);', [title, description, category, location, status, date, user_id, found_by]);
        res.status(201).json({ message: "Product added successfully", result });
    }catch(err){
        console.error('Error adding product:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

productrouter.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { title, description, category, location, status, date, user_id, found_by } = req.body;   
    try{
        const result = await    pool.query('UPDATE products SET title = ?, description = ?, category = ?, location = ?, status = ?, date = ?, user_id = ?, found_by = ? WHERE id = ?;', [title, description, category, location, status, date, user_id, found_by, id]);
        res.json({ message: "Product updated successfully", result });
    }catch(err){
        console.error('Error updating product:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

productrouter.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try{
        const result = await pool.query('DELETE FROM products WHERE id = ?;', [id]);
        res.json({ message: "Product deleted successfully", result });
    }catch(err){
        console.error('Error deleting product:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }   
})

export default productrouter;