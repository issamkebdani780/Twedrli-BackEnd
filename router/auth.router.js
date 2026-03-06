import { Router } from "express";
import pool from "../database.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const authRouter = Router();

// Signup Route
authRouter.post('/signup', async (req, res) => {
    const { name, email, password, role, department } = req.body;

    if (!name || !email || !password || !department) {
        return res.status(400).json({ error: "Missing required fields: name, email, password, and department are required." });
    }

    try {
        // Check if user already exists
        const [existingUsers] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            return res.status(400).json({ error: "Email already in use" });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert new user
        const [result] = await pool.query(
            'INSERT INTO users (name, email, password, role, department) VALUES (?, ?, ?, ?, ?)',
            [name, email, hashedPassword, role || 'user', department]
        );

        res.status(201).json({
            message: "User registered successfully",
            userId: result.insertId
        });
    } catch (err) {
        console.error("Signup error detail:", err);
        res.status(500).json({ error: "Internal Server Error", message: err.message });
    }
});

// Signin Route
authRouter.post('/signin', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Missing email or password" });
    }

    try {
        // Find user by email
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        const user = rows[0];

        if (!user) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        // Generate JWT
        const token = jwt.sign(
            { userId: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET || 'your_secret_key',
            { expiresIn: '1d' }
        );

        res.json({
            message: "Signin successful",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department
            }
        });
    } catch (err) {
        console.error("Signin error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

export default authRouter;
