import { Router } from "express";
import pool from "../database.js";

const messageRouter = Router();

// Get all messages for a specific conversation between two users
messageRouter.get('/:senderId/:receiverId', async (req, res) => {
    const { senderId, receiverId } = req.params;
    try {
        const [rows] = await pool.query(
            `SELECT * FROM messages 
             WHERE (sender_id = ? AND receiver_id = ?) 
             OR (sender_id = ? AND receiver_id = ?) 
             ORDER BY created_at ASC`,
            [senderId, receiverId, receiverId, senderId]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Get recent conversations for a user
messageRouter.get('/user/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const [rows] = await pool.query(
            `SELECT DISTINCT 
                CASE 
                    WHEN sender_id = ? THEN receiver_id 
                    ELSE sender_id 
                END AS contact_id,
                MAX(created_at) as last_message_at
             FROM messages 
             WHERE sender_id = ? OR receiver_id = ?
             GROUP BY contact_id
             ORDER BY last_message_at DESC`,
            [userId, userId, userId]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Send a message
messageRouter.post('/', async (req, res) => {
    const { sender_id, receiver_id, content } = req.body;
    if (!sender_id || !receiver_id || !content) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    try {
        const [result] = await pool.query(
            'INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)',
            [sender_id, receiver_id, content]
        );
        res.status(201).json({ message: "Message sent", messageId: result.insertId });
    } catch (err) {
        res.status(500).json({ error: 'Failed to send message' });
    }
});

// Delete a message
messageRouter.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await pool.query('DELETE FROM messages WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Message not found' });
        }
        res.json({ message: "Message deleted" });
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default messageRouter;
