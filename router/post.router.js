import { Router } from "express";
import pool from "../database.js";
const postrouter = Router();

postrouter.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM posts;');
        res.json(rows);
    } catch (err) {
        console.error('Error fetching posts:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

postrouter.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query('SELECT * FROM posts WHERE id = ?;', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Post not found' });
        }
        res.json(rows[0]);
    } catch (err) {
        console.error('Error fetching post:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

postrouter.post('/', async (req, res) => {
    const { user_id, product_id, title, description, created_at } = req.body;
    try {
        const result = await pool.query('INSERT INTO posts (user_id, product_id, title, description, created_at) VALUES (?, ?, ?, ?, ?);', [user_id, product_id, title, description, created_at]);
        res.status(201).json({ message: "Post added successfully", result });
    } catch(err){
        console.error('Error adding post:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

postrouter.put('/:id', async (req, res) => {
    const { id } = req.params;
    // allow partial updates by merging with existing row
    try {
        const [existingRows] = await pool.query('SELECT * FROM posts WHERE id = ?;', [id]);
        if (existingRows.length === 0) {
            return res.status(404).json({ error: 'Post not found' });
        }
        const existing = existingRows[0];
        const {
            user_id = existing.user_id,
            product_id = existing.product_id,
            title = existing.title,
            description = existing.description,
            created_at = existing.created_at,
        } = req.body;

        await pool.query(
            'UPDATE posts SET user_id = ?, product_id = ?, title = ?, description = ?, created_at = ? WHERE id = ?;',[
                user_id, product_id, title, description, created_at, id
            ]
        );
        const [updatedRows] = await pool.query('SELECT * FROM posts WHERE id = ?;', [id]);
        res.json({ message: "Post updated successfully", post: updatedRows[0] });
    } catch(err){
        console.error('Error updating post:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

postrouter.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try{
        const result = await pool.query('DELETE FROM posts WHERE id = ?;', [id]);
        res.json({ message: "Post deleted successfully", result });
    } catch(err){
        console.error('Error deleting post:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

export default postrouter;
