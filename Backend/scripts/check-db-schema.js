import sequelize from '../src/config/db.js';

async function inspectSchema() {
  try {
    await sequelize.authenticate();
    console.log("Connected to Database via Sequelize!");

    const [results, metadata] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    const tables = results.map(r => r.table_name);
    console.log("\nFound Tables:", tables);

    for (const table of tables) {
      const [cols, meta] = await sequelize.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = '${table}'
        ORDER BY ordinal_position;
      `);

      console.log(`\nTable: "${table}"`);
      cols.forEach(col => {
        console.log(`  - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
      });
    }

  } catch (err) {
    console.error("Error inspecting DB:", err);
  } finally {
    await sequelize.close();
  }
}

inspectSchema();
