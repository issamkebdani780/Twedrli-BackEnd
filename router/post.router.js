import { Router } from "express";
import pool from "../database.js";
const postrouter = Router();

postrouter.get('/', async (req, res) => {
    try {
        const query = `
            SELECT 
                p.id, p.title, p.description, p.created_at,
                u.name as user_name, u.email as user_email,
                pr.category, pr.status, pr.location, pr.date as product_date
            FROM posts p
            JOIN users u ON p.user_id = u.id
            JOIN products pr ON p.product_id = pr.id;
        `;
        const [rows] = await pool.query(query);
        
        const formattedData = rows.map(row => ({
            id: row.id,
            title: row.title,
            description: row.description,
            created_at: row.created_at,
            user: {
                name: row.user_name,
                email: row.user_email,
                avatar: row.user_name ? row.user_name.charAt(0).toUpperCase() : 'U'
            },
            product: {
                category: row.category,
                status: row.status,
                location: row.location,
                // Fallback image since the column doesn't exist in your DB
                img: 'https://via.placeholder.com/300?text=No+Image' 
            }
        }));

        res.json(formattedData);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    } 
});

postrouter.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const query = `
            SELECT posts.*, users.name as author_name, products.title as product_title
            FROM posts
            JOIN users ON posts.user_id = users.id
            JOIN products ON posts.product_id = products.id
            WHERE posts.id = ?;
        `;
        const [rows] = await pool.query(query, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Post not found' });
        }
        res.json(rows[0]);
    } catch (err) {
        console.error('Error fetching post:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

postrouter.post('/', async (req, res) => {
    const { user_id, product_id, title, description } = req.body;

    try {
        const [userRows] = await pool.query('SELECT id FROM users WHERE id = ?', [user_id]);
        if (userRows.length === 0) {
            return res.status(404).json({ error: `User with ID ${user_id} does not exist.` });
        }

        const [productRows] = await pool.query('SELECT id FROM products WHERE id = ?', [product_id]);
        if (productRows.length === 0) {
            return res.status(404).json({ error: `Product with ID ${product_id} does not exist.` });
        }

        const [result] = await pool.query(
            'INSERT INTO posts (user_id, product_id, title, description) VALUES (?, ?, ?, ?);', 
            [user_id, product_id, title, description]
        );

        res.status(201).json({ 
            message: "Post created successfully", 
            postId: result.insertId 
        });

    } catch (err) {
        console.error('Error creating post:', err);
        res.status(500).json({ error: 'Internal Server Error', details: err.message });
    }
});

postrouter.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { title, description } = req.body;

    try {
        const sql = `
            UPDATE posts 
            SET 
                title = COALESCE(?, title), 
                description = COALESCE(?, description)
            WHERE id = ?;
        `;
        const [result] = await pool.query(sql, [title || null, description || null, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Post not found or no changes made' });
        }
        res.json({ message: "Post updated successfully" });
    } catch (err) {
        console.error('Error updating post:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

postrouter.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await pool.query('DELETE FROM posts WHERE id = ?;', [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Post not found' });
        }
        res.json({ message: "Post deleted successfully" });
    } catch (err) {
        console.error('Error deleting post:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default postrouter;