import sequelize from '../src/config/db.js';

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('DATABASE_URL is missing. Set it in your environment (or Backend/.env) then re-run.');
    process.exit(1);
  }

  try {
    await sequelize.authenticate();

    const [tables] = await sequelize.query(`
      SELECT table_schema, table_name
      FROM information_schema.tables
      WHERE table_schema NOT IN ('pg_catalog','information_schema')
      ORDER BY table_schema, table_name;
    `);

    console.log('=== Tables ===');
    for (const t of tables) console.log(`${t.table_schema}.${t.table_name}`);

    const [cols] = await sequelize.query(`
      SELECT table_schema, table_name, column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema NOT IN ('pg_catalog','information_schema')
      ORDER BY table_schema, table_name, ordinal_position;
    `);

    console.log('\n=== Columns ===');
    let current = '';
    for (const c of cols) {
      const key = `${c.table_schema}.${c.table_name}`;
      if (key !== current) {
        current = key;
        console.log(`\n${current}`);
      }
      console.log(`  - ${c.column_name} (${c.data_type}) nullable=${c.is_nullable}`);
    }

    process.exit(0);
  } catch (e) {
    console.error('DB inspection failed:', e.message);
    process.exit(1);
  }
}

main();


