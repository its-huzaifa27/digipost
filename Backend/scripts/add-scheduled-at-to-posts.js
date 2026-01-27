
import sequelize from '../src/config/db.js';
import { DataTypes } from 'sequelize';

async function addScheduledAtToPosts() {
    try {
        const queryInterface = sequelize.getQueryInterface();
        
        console.log('Checking Posts table schema...');
        const tableInfo = await queryInterface.describeTable('Posts');
        
        if (!tableInfo.scheduledAt) {
            console.log('Adding scheduledAt column to Posts table...');
            await queryInterface.addColumn('Posts', 'scheduledAt', {
                type: DataTypes.DATE,
                allowNull: true
            });
            console.log('scheduledAt column added successfully.');
        } else {
            console.log('scheduledAt column already exists.');
        }

    } catch (error) {
        console.error('Error updating schema:', error);
    } finally {
        await sequelize.close();
    }
}

addScheduledAtToPosts();
