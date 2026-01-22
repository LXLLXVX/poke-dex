require('dotenv').config();
const express = require('express');
const cors = require('cors');

const pokemonRoutes = require('./src/routes/pokemon.routes');
const trainerRoutes = require('./src/routes/trainer.routes');
const typeRoutes = require('./src/routes/type.routes');
const { runMigrations } = require('./src/database/runMigrations');
const { runSeeders } = require('./src/database/runSeeders');
const teamRoutes = require('./src/routes/team.routes');

const PORT = process.env.PORT || 4000;
const rawOrigins = process.env.CLIENT_ORIGINS || process.env.CLIENT_ORIGIN || 'http://localhost:5173,http://localhost:5174';
const ALLOWED_ORIGINS = rawOrigins
	.split(',')
	.map((origin) => origin.trim())
	.filter(Boolean);

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
		origin(requestOrigin, callback) {
			if (!requestOrigin) {
				return callback(null, true);
			}

			if (ALLOWED_ORIGINS.includes(requestOrigin)) {
				return callback(null, true);
			}

			console.warn(`[cors] Blocked origin: ${requestOrigin}`);
			return callback(new Error('Not allowed by CORS'));
		},
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
app.use('/api/team', teamRoutes);

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
