require('dotenv').config();
const express = require('express');
const cors = require('cors');

const pokemonRoutes = require('./src/routes/pokemon.routes');
const trainerRoutes = require('./src/routes/trainer.routes');
const typeRoutes = require('./src/routes/type.routes');
const { runMigrations } = require('./src/database/runMigrations');
const { runSeeders } = require('./src/database/runSeeders');

const PORT = process.env.PORT || 4000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

const app = express();

function isFlagEnabled(value) {
	return String(value).trim().toLowerCase() === 'true';
}

async function autoSetupDatabase() {
	const shouldMigrate = isFlagEnabled(process.env.DB_AUTO_MIGRATE);
	const shouldSeed = isFlagEnabled(process.env.DB_AUTO_SEED);

	if (!shouldMigrate && !shouldSeed) {
		return;
	}

	console.info('[bootstrap] DB_AUTO_SETUP enabled');

	if (shouldMigrate) {
		await runMigrations('up');
	}

	if (shouldSeed) {
		await runSeeders();
	}
}

app.use(
	cors({
		origin: CLIENT_ORIGIN,
	})
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
	res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/pokemon', pokemonRoutes);
app.use('/api/trainers', trainerRoutes);
app.use('/api/types', typeRoutes);

app.use((req, res) => {
	res.status(404).json({ message: 'Not found' });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
	console.error(err);
	const status = err.status || 500;
	res.status(status).json({ message: err.message || 'Unexpected error' });
});

async function start() {
	await autoSetupDatabase();

	return app.listen(PORT, () => {
		console.info(`API listening on http://localhost:${PORT}`);
	});
}

if (require.main === module) {
	start().catch((error) => {
		console.error('[bootstrap] Failed to start server', error);
		process.exit(1);
	});
}

module.exports = app;
module.exports.start = start;
