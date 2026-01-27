
import sequelize from '../src/config/db.js';
import { DataTypes } from 'sequelize';

async function addClientIdToPosts() {
    try {
        const queryInterface = sequelize.getQueryInterface();
        
        console.log('Checking Posts table schema...');
        const tableInfo = await queryInterface.describeTable('Posts');
        
        if (!tableInfo.clientId) {
            console.log('Adding clientId column to Posts table...');
            await queryInterface.addColumn('Posts', 'clientId', {
                type: DataTypes.UUID,
                allowNull: true, // Allow null initially for existing posts
                references: {
                    model: 'Clients',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            });
            console.log('clientId column added successfully.');
        } else {
            console.log('clientId column already exists.');
        }

    } catch (error) {
        console.error('Error updating schema:', error);
    } finally {
        await sequelize.close();
    }
}

addClientIdToPosts();
