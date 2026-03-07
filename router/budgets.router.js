import { Router } from "express";
import pool from "../database.js";

const budgetsRouter = Router();

budgetsRouter.get('/', async (req, res) => {
    try {
        const [budgets] = await pool.query('SELECT * FROM budgets');
        res.json(budgets);

    } catch (err) {
        console.error("Error fetching budgets:", err);
        res.status(500).json({ error: "Internal Server Error", message: err.message });
    }
});

budgetsRouter.post('/', async (req, res) => {
    try {
        const { name, value, user_id } = req.body;
        const [result] = await pool.query('INSERT INTO budgets (name, value, user_id) VALUES (?, ?, ?)', [name, value, user_id]);
        res.status(201).json({ message: "Budget created successfully", id: result.insertId });
    } catch (err) {
        console.error("Error creating budget:", err);
        res.status(500).json({ error: "Internal Server Error", message: err.message });
    }
});

budgetsRouter.get('/:id', async(req, res) => {
    try{
        const userId = req.params.id;
        const [rows] = await pool.query('SELECT * FROM budgets WHERE user_id = ?', [userId]);
        if(rows.length === 0){
            return res.status(404).json({ error: "Budget not found for the specified user ID" });
        }   
        res.json(rows);
    }catch(err){
        console.error("Error fetching budget by user ID:", err);
        res.status(500).json({ error: "Internal Server Error", message: err.message });
    }
});

budgetsRouter.put('/:id', async (req, res) => {
    try {
        const budgetId = req.params.id;
        const { value } = req.body;
        const [result] = await pool.query('UPDATE budgets SET value = ? WHERE id = ?', [value, budgetId]); 

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Budget not found" });
        }

        res.json({ message: "Budget updated successfully" });

    } catch (err) {
        console.error("Error updating budget:", err);
        res.status(500).json({ error: "Internal Server Error", message: err.message });
    }
});

budgetsRouter.delete('/:id', async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM budgets WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Budget not found" });
        }
        res.json({ message: "Budget deleted successfully" });
    } catch (err) {
        console.error("Error deleting budget:", err);
        res.status(500).json({ error: "Internal Server Error", message: err.message });
    }
});

export default budgetsRouter;