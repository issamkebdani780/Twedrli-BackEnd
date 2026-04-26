import pool from './database.js';

try {
    const [rows] = await pool.query('SELECT 1 + 1 AS result');
    console.log('Database connection successful:', rows);
    const [tables] = await pool.query('SHOW TABLES');
    console.log('Tables in database:', tables);
} catch (err) {
    console.error('Database connection failed:', err.message);
} finally {
    process.exit();
}
