import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

const dbUrl = process.env.DATABASE_URL;

console.log('Testing connection to:', dbUrl);

const sequelize = new Sequelize(dbUrl, {
    dialect: 'postgres',
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    }
});

async function test() {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
        await sequelize.close();
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}

test();
