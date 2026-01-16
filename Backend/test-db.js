import { Sequelize } from 'sequelize';

const dbUrl = 'postgresql://postgres:DatamatexTechnology@db.vguyfopzgxisborxmsni.supabase.co:5432/postgres';

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
