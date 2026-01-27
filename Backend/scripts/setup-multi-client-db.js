
import sequelize from '../src/config/db.js';

async function setupMultiClientDB() {
  try {
    await sequelize.authenticate();
    console.log("Connected to Database via Sequelize!");

    // 1. Create Clients Table
    console.log("\n--- Creating Clients Table ---");
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS "Clients" (
        "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        "userId" UUID NOT NULL REFERENCES "Users"("id") ON DELETE CASCADE,
        "name" VARCHAR(255) NOT NULL,
        "industry" VARCHAR(255),
        "brandDescription" TEXT,
        "instagramEnabled" BOOLEAN DEFAULT false,
        "facebookEnabled" BOOLEAN DEFAULT false,
        "twitterEnabled" BOOLEAN DEFAULT false,
        "linkedinEnabled" BOOLEAN DEFAULT false,
        "whatsappEnabled" BOOLEAN DEFAULT false,
        "pinterestEnabled" BOOLEAN DEFAULT false,
        "tiktokEnabled" BOOLEAN DEFAULT false,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log("✅ Clients Table Created.");

    // 2. Modify PlatformConnections (Add clientId, make userId optional)
    console.log("\n--- Updating PlatformConnections Table ---");
    
    // Check if column exists first to avoid error
    try {
        await sequelize.query(`
            ALTER TABLE "PlatformConnections" 
            ADD COLUMN IF NOT EXISTS "clientId" UUID REFERENCES "Clients"("id") ON DELETE CASCADE;
        `);
        console.log("✅ Added clientId column to PlatformConnections.");
    } catch (e) {
        console.log("ℹ️ clientId column might already exist:", e.message);
    }

    try {
        await sequelize.query(`
            ALTER TABLE "PlatformConnections" 
            ALTER COLUMN "userId" DROP NOT NULL;
        `);
        console.log("✅ Made userId optional in PlatformConnections.");
    } catch (e) {
        console.log("ℹ️ Could not alter userId column:", e.message);
    }

    // 3. Security (RLS)
    console.log("\n--- Securing Tables (Enabling RLS) ---");
    try {
        await sequelize.query(`ALTER TABLE "Clients" ENABLE ROW LEVEL SECURITY;`);
        console.log("✅ RLS Enabled for Clients.");
    } catch (e) {
        console.log("ℹ️ RLS setup issue:", e.message);
    }

    console.log("\n🎉 Multi-Client DB Setup Complete!");

  } catch (err) {
    console.error("\n❌ Error in setup:", err);
  } finally {
    await sequelize.close();
  }
}

setupMultiClientDB();
