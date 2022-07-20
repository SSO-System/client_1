import { Pool } from 'pg';

let pool = new Pool({
        user: 'sso',
        host: '42.117.5.115',
        database: 'INTERN-SSO',
        password: 'dientoan@123',
        port: '5432'
});

export const db = pool;