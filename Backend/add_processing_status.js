import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, ".env");
dotenv.config({ path: envPath });

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
});

async function run() {
  try {
    await sequelize.authenticate();
    console.log('Connected to DB. Adding "processing" to enum...');

    // Add 'processing' to the enum type
    await sequelize.query(`
            ALTER TYPE "enum_Posts_status" ADD VALUE IF NOT EXISTS 'processing';
        `);

    console.log('✅ Success: Added "processing" to enum_Posts_status.');
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

run();
