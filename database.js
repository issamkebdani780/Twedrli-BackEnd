import mysql2 from 'mysql2'
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql2.createPool({
    host: process.env.MYSQLHOST,
    user: process.env.MYSQLUSER,
    database: process.env.MYSQLDATABASE,
    password: process.env.MYSQLPASSWORD,
    port: process.env.MYSQLPORT
})

// Export promise-based pool so callers can use async/await
const promisePool = pool.promise();
export default promisePool;