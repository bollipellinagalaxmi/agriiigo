import mysql from 'mysql2/promise';
import 'dotenv/config';

if ((process.env.DB_NAME || 'agriiigo') !== 'agriiigo') throw new Error('Agriiigo API must use DB_NAME=agriiigo');
export const pool = mysql.createPool({ host: process.env.DB_HOST || 'localhost', user: process.env.DB_USER || 'root', password: process.env.DB_PASS || '', database: 'agriiigo', waitForConnections: true, connectionLimit: 10, decimalNumbers: true, dateStrings: true });
export async function query(sql, params = []) { const [rows] = await pool.execute(sql, params); return rows; }
