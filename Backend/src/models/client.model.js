import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import User from './user.model.js';

const Client = sequelize.define('Client', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    industry: {
        type: DataTypes.STRING,
        allowNull: true
    },
    brandDescription: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    // We can keep these flags or infer from connections, but keeping them is fine for UI toggles
    instagramEnabled: { type: DataTypes.BOOLEAN, defaultValue: false },
    facebookEnabled: { type: DataTypes.BOOLEAN, defaultValue: false },
    twitterEnabled: { type: DataTypes.BOOLEAN, defaultValue: false },
    linkedinEnabled: { type: DataTypes.BOOLEAN, defaultValue: false },
    whatsappEnabled: { type: DataTypes.BOOLEAN, defaultValue: false },
    pinterestEnabled: { type: DataTypes.BOOLEAN, defaultValue: false },
    tiktokEnabled: { type: DataTypes.BOOLEAN, defaultValue: false },
    // Service Status (Pause/Resume)
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true }
}, {
    tableName: 'Clients', // PascalCase table
    timestamps: true
});

// Define Association
User.hasMany(Client, { foreignKey: 'userId' });
Client.belongsTo(User, { foreignKey: 'userId' });

export default Client;
