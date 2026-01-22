
import sequelize from '../src/config/db.js';

async function checkSchema() {
    try {
        const [results] = await sequelize.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'Posts';
        `);
        console.log('Columns in Posts table:', results);
    } catch (error) {
        console.error('Error checking schema:', error);
    } finally {
        await sequelize.close();
    }
}

checkSchema();
