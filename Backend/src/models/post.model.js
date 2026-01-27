import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Post = sequelize.define(
  "Post",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    clientId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "Clients",
        key: "id",
      },
    },
    content: {
      type: DataTypes.TEXT, // The caption/text
      allowNull: true,
    },
    mediaUrl: {
      type: DataTypes.STRING, // URL to image/video on our server/bucket
      allowNull: true,
    },
    mediaType: {
      type: DataTypes.ENUM("image", "video", "text"),
      defaultValue: "text",
    },
    platforms: {
      type: DataTypes.ARRAY(DataTypes.STRING), // ['facebook', 'instagram']
      defaultValue: [],
    },
    status: {
      type: DataTypes.ENUM(
        "pending",
        "published",
        "failed",
        "partial",
        "scheduled",
        "processing",
      ),
      defaultValue: "pending",
    },
    scheduledAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    results: {
      type: DataTypes.JSONB, // Store detailed API responses per platform
      // e.g. { facebook: { success: true, postId: '...' }, instagram: { success: false, error: '...' } }
      defaultValue: {},
    },
  },
  {
    timestamps: true,
  },
);

import Client from "./client.model.js";

// Define Associations
Post.belongsTo(Client, { foreignKey: "clientId" });
Client.hasMany(Post, { foreignKey: "clientId" });

export default Post;
