import { Sequelize, Op, DataTypes } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '.env');
dotenv.config({ path: envPath });

const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: console.log, // Enable SQL logging
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    }
});

const mkClient = () => sequelize.define('Client', {
    id: { type: DataTypes.UUID, primaryKey: true },
    name: DataTypes.STRING,
    isActive: DataTypes.BOOLEAN
}, { tableName: 'Clients', timestamps: true });

const mkPost = () => sequelize.define('Post', {
    id: { type: DataTypes.UUID, primaryKey: true },
    content: DataTypes.TEXT,
    status: DataTypes.STRING,
    scheduledAt: DataTypes.DATE,
    clientId: DataTypes.UUID
}, { tableName: 'Posts', timestamps: true });

async function run() {
    try {
        await sequelize.authenticate();
        console.log('Connected to DB');

        const Client = mkClient();
        const Post = mkPost();

        Post.belongsTo(Client, { foreignKey: 'clientId' });
        Client.hasMany(Post, { foreignKey: 'clientId' });

        const now = new Date();
        console.log(`\n--- CRON CHECK (${now.toISOString()}) ---`);

        // Check 1: Do we have ANY suspended clients?
        const suspendedClients = await Client.findAll({ where: { isActive: false } });
        console.log(`Suspended Clients: ${suspendedClients.length}`);
        if (suspendedClients.length > 0) {
            suspendedClients.forEach(c => console.log(` - ID: ${c.id}, Name: ${c.name}`));
        } else {
            console.log(' WARNING: No suspended clients found! Check if toggle worked.');
        }

        // Check 2: The CRON Query
        const cronPosts = await Post.findAll({
            where: {
                status: 'scheduled',
                scheduledAt: { [Op.lte]: now }
            },
            include: [{
                model: Client,
                where: { isActive: true }, // Filter: Must be Active
                required: true // Inner Join
            }]
        });

        console.log(`\nPosts returned by Cron Query: ${cronPosts.length}`);
        cronPosts.forEach(p => {
            console.log(` - PostID: ${p.id}, Client: ${p.Client.name} (Active: ${p.Client.isActive})`);
        });

    } catch (e) {
        console.error(e);
    } finally {
        await sequelize.close();
    }
}

run();
