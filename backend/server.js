require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const { createServer } = require('http');
const { Server } = require('socket.io');

const pokemonRoutes = require('./src/routes/pokemon.routes');
const trainerRoutes = require('./src/routes/trainer.routes');
const typeRoutes = require('./src/routes/type.routes');
const authRoutes = require('./src/routes/auth.routes');
const dashboardRoutes = require('./src/routes/dashboard.routes');
const { runMigrations } = require('./src/database/runMigrations');
const { runSeeders } = require('./src/database/runSeeders');
const teamRoutes = require('./src/routes/team.routes');
const { setRealtimeServer } = require('./src/services/realtimeService');

const PORT = process.env.PORT || 4000;
const rawOrigins = process.env.CLIENT_ORIGINS || process.env.CLIENT_ORIGIN || 'http://localhost:5173,http://localhost:5174';
const ALLOWED_ORIGINS = rawOrigins
	.split(',')
	.map((origin) => origin.trim())
	.filter(Boolean);

const app = express();

const SESSION_SECRET = process.env.SESSION_SECRET || process.env.JWT_SECRET || 'dev-session-secret-change-me';
const SESSION_MAX_AGE = Number(process.env.SESSION_MAX_AGE_MS || 1000 * 60 * 60 * 2);

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
				if (!requestOrigin) return callback(null, true);

				// Allow explicit configured origins
				if (ALLOWED_ORIGINS.includes(requestOrigin)) return callback(null, true);

				// Allow localhost dev servers on any port (useful for Vite)
				try {
					if (requestOrigin.startsWith('http://localhost') || requestOrigin.startsWith('http://127.0.0.1')) {
						return callback(null, true);
					}
				} catch (e) {}

				console.warn(`[cors] Blocked origin: ${requestOrigin}`);
				return callback(new Error('Not allowed by CORS'));
		},
		credentials: true,
	})
);

app.use(
	session({
		name: 'poke.team.sid',
		secret: SESSION_SECRET,
		resave: false,
		saveUninitialized: false,
		cookie: {
			httpOnly: true,
			sameSite: 'lax',
			secure: process.env.NODE_ENV === 'production',
			maxAge: SESSION_MAX_AGE,
		},
	})
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
	res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
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

	const server = createServer(app);
	const io = new Server(server, {
		cors: {
			origin: ALLOWED_ORIGINS,
			credentials: true,
		},
	});
	setRealtimeServer(io);

	return server.listen(PORT, () => {
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
