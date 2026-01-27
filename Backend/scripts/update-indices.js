
import sequelize from '../src/config/db.js';

async function updatePlatformConnectionIndices() {
    try {
        await sequelize.authenticate();
        console.log("Connected to Database.");

        const queryInterface = sequelize.getQueryInterface();

        // 1. Drop existing unique constraints/indices if they restrict us
        // Common default names or the one we defined before using userId
        console.log("Checking for old indices...");
        
        // Try to drop the old unique index that was likely on [userId, platform, pageId]
        // Since we don't know the exact name, we can try common variations or just define the new one.
        // But if the old one exists, it might prevent duplicates that we now allow (e.g. same user managing different clients' same page? unlikely, but same user managing multiple clients might have connection overlap conceptually?)
        // Actually, the goal is: ensure (clientId, platform, pageId) is unique.
        // UserID usage is now secondary.

        // Let's brute-force drop potential old constraints to be clean.
        // Note: 'platform_connections_user_id_platform_page_id_key' is a likely auto-generated name for unique(userId, platform, pageId).
        try {
            await sequelize.query(`
                DROP INDEX IF EXISTS "platform_connections_user_id_platform_page_id";
                DROP INDEX IF EXISTS "platform_connections_user_id_platform_page_id_key";
                DROP INDEX IF EXISTS "platform_connections_unique_user_page"; -- Custom name if relevant
            `);
            console.log("Dropped old indices (if they existed).");
        } catch (e) {
            console.warn("Soft warning during drop:", e.message);
        }

        // 2. Add the NEW unique index for Multi-Client support
        // (clientId, platform, pageId)
        console.log("Creating new unique index on (clientId, platform, pageId)...");
        try {
            await sequelize.query(`
                CREATE UNIQUE INDEX IF NOT EXISTS "platform_connections_client_platform_page"
                ON "PlatformConnections" ("clientId", "platform", "pageId");
            `);
            console.log("✅ New unique index created.");
        } catch (e) {
            console.error("Failed to create new index:", e.message);
        }

        console.log("Index update complete.");

    } catch (err) {
        console.error("Critical error updating indices:", err);
    } finally {
        await sequelize.close();
    }
}

updatePlatformConnectionIndices();
