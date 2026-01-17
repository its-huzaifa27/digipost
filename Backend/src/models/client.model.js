import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import User from './user.model.js';

const Client = sequelize.define('Client', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    moderator_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    },
    client_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    industry: {
        type: DataTypes.STRING,
        allowNull: true
    },
    brand_description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    // Platform Flags
    instagram_enabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    facebook_enabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    twitter_enabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    linkedin_enabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    whatsapp_enabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    pinterest_enabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    tiktok_enabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    tableName: 'clients',
    timestamps: true,
    underscored: true // auto mapping to created_at, updated_at
});

// Define Association
User.hasMany(Client, { foreignKey: 'moderator_id' });
Client.belongsTo(User, { foreignKey: 'moderator_id' });

export default Client;
