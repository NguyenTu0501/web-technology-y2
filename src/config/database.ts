import {env} from '../index.js' 
import mysql, {type Pool} from 'mysql2/promise';

const pool: Pool = mysql.createPool({
    host:"localhost",
    user:"root",
    password:env.dbPassword as string,
    database:env.dbUrl as string
});

export function getPool(): Pool{
    return pool;
}