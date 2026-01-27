import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const AuditLog = sequelize.define('AuditLog', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: true // Null means system action or unauthenticated
    },
    action: {
        type: DataTypes.STRING,
        allowNull: false
    },
    details: {
        type: DataTypes.TEXT, // Using TEXT for flexibility (JSON stringified)
        allowNull: true
    },
    ipAddress: {
        type: DataTypes.STRING,
        allowNull: true
    },
    entityId: {
        type: DataTypes.STRING,
        allowNull: true // ID of the object affected (e.g., Post ID, Client ID)
    }
}, {
    tableName: 'AuditLogs',
    timestamps: true,
    updatedAt: false // Logs are immutable, only createdAt matters
});

export default AuditLog;
