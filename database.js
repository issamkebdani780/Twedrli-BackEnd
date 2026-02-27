import mysql2 from 'mysql2'


const pool = mysql2.createPool({
    host: '',
    user: '',
    database: '',
    password: '',
    port: ''
})

export default pool;