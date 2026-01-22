import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import Post from './post.model.js';

const PostSchedule = sequelize.define('PostSchedule', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    postId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: Post,
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    platform: {
        type: DataTypes.STRING, // e.g. 'facebook', 'instagram'
        allowNull: false,
    },
    scheduledAt: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('pending', 'published', 'failed'),
        defaultValue: 'pending',
    },
    errorMessage: {
        type: DataTypes.TEXT,
        allowNull: true,
    }
}, {
    timestamps: true,
    indexes: [
        {
            fields: ['scheduledAt']
        },
        {
            fields: ['status']
        }
    ]
});

// Define Association
Post.hasMany(PostSchedule, { foreignKey: 'postId', as: 'schedules' });
PostSchedule.belongsTo(Post, { foreignKey: 'postId' });

export default PostSchedule;
