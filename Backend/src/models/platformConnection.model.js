import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import { encrypt, decrypt } from '../utils/encryption.js';

import Client from './client.model.js';

const PlatformConnection = sequelize.define('PlatformConnection', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    // A connection belongs to a specific Client (Brand)
    clientId: {
        type: DataTypes.UUID,
        allowNull: true, // Allow null initially for migration, but should eventually be required
        references: {
            model: Client,
            key: 'id'
        }
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: true, // Now optional, as clientId is the primary owner
    },
    platform: {
        type: DataTypes.ENUM('facebook', 'instagram', 'linkedin', 'twitter'),
        allowNull: false,
    },
    platformUserId: { // The User's ID on the platform (e.g. Facebook User ID)
        type: DataTypes.STRING,
        allowNull: true,
    },
    pageId: { // The specific Page ID we are managing
        type: DataTypes.STRING,
        allowNull: true,
    },
    pageName: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    igBusinessId: { // Specifically for Instagram Business accounts
        type: DataTypes.STRING,
        allowNull: true,
    },
    // We use a virtual field for easy access, but store encrypted
    accessToken: {
        type: DataTypes.TEXT,
        allowNull: false,
        get() {
            const rawValue = this.getDataValue('accessToken');
            return rawValue ? decrypt(rawValue) : null;
        },
        set(value) {
            this.setDataValue('accessToken', encrypt(value));
        }
    },
    tokenExpiry: {
        type: DataTypes.DATE, // When the token expires (for Long-Lived tokens)
        allowNull: true,
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    }
}, {
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['clientId', 'platform', 'pageId'] // Unique per client
        }
    ]
});

// Associations
Client.hasMany(PlatformConnection, { foreignKey: 'clientId' });
PlatformConnection.belongsTo(Client, { foreignKey: 'clientId' });

export default PlatformConnection;
