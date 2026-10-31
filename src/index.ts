import dotenv from 'dotenv'

dotenv.config({
    path: ".env"
});

export const env = {
    dbPassword: process.env.DB_PASSWORD,
    dbUrl: process.env.DB_URL
} as const;