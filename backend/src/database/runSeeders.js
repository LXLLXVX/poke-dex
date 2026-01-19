const pool = require('./pool');

const seeders = [
  { name: '001_types_seeder', module: require('./seeders/001_types_seeder') },
  { name: '002_trainers_seeder', module: require('./seeders/002_trainers_seeder') },
  { name: '003_pokemon_seeder', module: require('./seeders/003_pokemon_seeder') },
];

async function runSeeders() {
  for (const seeder of seeders) {
    if (typeof seeder.module.seed !== 'function') {
      console.warn(`[seed] ${seeder.name} missing seed handler, skipping`);
      continue;
    }

    console.info(`[seed] running ${seeder.name}`);
    await seeder.module.seed(pool);
  }
}

module.exports = { runSeeders };

if (require.main === module) {
  runSeeders()
    .then(() => {
      console.info('[seed] completed');
      return pool.end();
    })
    .catch(async (error) => {
      console.error('[seed] failed:', error);
      await pool.end();
      process.exit(1);
    });
}
