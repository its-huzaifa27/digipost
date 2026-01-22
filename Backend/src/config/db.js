import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Go up two levels from src/config to Backend root
const envPath = path.resolve(__dirname, '../../.env');

console.log("CWD:", process.cwd());
console.log("Checking .env at:", envPath);
console.log(".env exists?", fs.existsSync(envPath));

const result = dotenv.config({ path: envPath });

console.log("Dotenv result:", result.error ? result.error : "Success");
console.log("Parsed keys:", result.parsed ? Object.keys(result.parsed) : "None");
console.log("PORT loaded?", process.env.PORT);

console.log("DB URL (Env):", process.env.DATABASE_URL ? "Loaded" : "Missing");

const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false, // Set to console.log to see SQL queries
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false // Required for Supabase/Heroku sometimes
        }
    }
});

export const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('PostgreSQL Connected via Sequelize');
        // Sync models (create tables if not exist)
        await sequelize.sync();
        console.log('Database Synced');
    } catch (error) {
        console.error('Database connection error:', error);
        process.exit(1);
    }
};

export default sequelize;
