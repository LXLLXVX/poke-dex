const pool = require('./pool');

const migrations = [
  { name: '001_create_types_table', module: require('./migrations/001_create_types_table') },
  { name: '002_create_trainers_table', module: require('./migrations/002_create_trainers_table') },
  { name: '003_create_pokemon_table', module: require('./migrations/003_create_pokemon_table') },
  { name: '004_add_trainer_portrait', module: require('./migrations/004_add_trainer_portrait') },
  { name: '005_add_unique_trainer_name', module: require('./migrations/005_add_unique_trainer_name') },
];

async function ensureMigrationsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name VARCHAR(191) NOT NULL PRIMARY KEY,
      ran_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
}

async function getAppliedMigrations() {
  const [rows] = await pool.query('SELECT name FROM schema_migrations');
  return new Set(rows.map((row) => row.name));
}

async function markApplied(name) {
  await pool.query('INSERT INTO schema_migrations (name) VALUES (?) ON DUPLICATE KEY UPDATE ran_at = CURRENT_TIMESTAMP', [name]);
}

async function unmarkApplied(name) {
  await pool.query('DELETE FROM schema_migrations WHERE name = ?', [name]);
}

async function runMigrations(direction = 'up') {
  if (!['up', 'down'].includes(direction)) {
    throw new Error(`Invalid direction: ${direction}`);
  }

  await ensureMigrationsTable();
  const applied = await getAppliedMigrations();
  const items = direction === 'down' ? [...migrations].reverse() : migrations;

  for (const migration of items) {
    const handler = migration.module[direction];
    if (typeof handler !== 'function') {
      console.warn(`[migration] ${migration.name} missing ${direction} handler, skipping`);
      continue;
    }

    const alreadyApplied = applied.has(migration.name);
    if (direction === 'up' && alreadyApplied) {
      console.info(`[migration] SKIP ${migration.name} (already applied)`);
      continue;
    }

    if (direction === 'down' && !alreadyApplied) {
      console.info(`[migration] SKIP ${migration.name} (not applied)`);
      continue;
    }

    console.info(`[migration] ${direction.toUpperCase()} ${migration.name}`);
    await handler(pool);

    if (direction === 'up') {
      await markApplied(migration.name);
    } else {
      await unmarkApplied(migration.name);
    }
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
