
import sequelize from '../src/config/db.js';

async function secureAndSetupDB() {
  try {
    await sequelize.authenticate();
    console.log("Connected to Database via Sequelize!");

    // 1. Create PostSchedules Table
    console.log("\n--- Creating PostSchedules Table ---");
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS "PostSchedules" (
        "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        "postId" UUID NOT NULL REFERENCES "Posts"("id") ON DELETE CASCADE,
        "platform" VARCHAR(255) NOT NULL,
        "scheduledAt" TIMESTAMP WITH TIME ZONE NOT NULL,
        "status" VARCHAR(50) DEFAULT 'pending', 
        "errorMessage" TEXT,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log("✅ PostSchedules Table Created (or already exists).");

    // 2. Create Index for performance
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS "idx_post_schedules_time" ON "PostSchedules" ("scheduledAt");
    `);
    console.log("✅ Index on 'scheduledAt' checked.");

    // 3. SECURE TABLES (Enable RLS)
    // This removes the "Unrestricted" warning in Supabase
    console.log("\n--- Securing Tables (Enabling RLS) ---");
    
    const tablesToSecure = ["Posts", "PlatformConnections", "PostSchedules", "Users"];
    
    for (const table of tablesToSecure) {
      try {
        await sequelize.query(`
            ALTER TABLE "${table}" ENABLE ROW LEVEL SECURITY;
        `);
        console.log(`✅ RLS Enabled for table: "${table}"`);
      } catch (err) {
        console.warn(`⚠️ Could not enable RLS for "${table}" (might already be enabled or table missing):`, err.message);
      }
    }

    console.log("\nSUCCESS: Database setup and security check complete.");

  } catch (err) {
    console.error("\n❌ Error in setup:", err);
  } finally {
    await sequelize.close();
  }
}

secureAndSetupDB();
