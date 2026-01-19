const pool = require('./pool');

const migrations = [
  { name: '001_create_types_table', module: require('./migrations/001_create_types_table') },
  { name: '002_create_trainers_table', module: require('./migrations/002_create_trainers_table') },
  { name: '003_create_pokemon_table', module: require('./migrations/003_create_pokemon_table') },
];

async function runMigrations(direction = 'up') {
  if (!['up', 'down'].includes(direction)) {
    throw new Error(`Invalid direction: ${direction}`);
  }

  for (const migration of migrations) {
    const handler = migration.module[direction];
    if (typeof handler !== 'function') {
      console.warn(`[migration] ${migration.name} missing ${direction} handler, skipping`);
      continue;
    }

    console.info(`[migration] ${direction.toUpperCase()} ${migration.name}`);
    await handler(pool);
  }
}

module.exports = { runMigrations };

if (require.main === module) {
  const direction = process.argv[2] || 'up';

  runMigrations(direction)
    .then(() => {
      console.info(`[migration] ${direction} completed`);
      return pool.end();
    })
    .catch(async (error) => {
      console.error('[migration] failed:', error);
      await pool.end();
      process.exit(1);
    });
}
