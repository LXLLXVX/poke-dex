const pool = require('../database/pool');

function mapRow(row) {
	if (!row) return null;
	return {
		id: row.id,
		username: row.username,
		passwordHash: row.password_hash,
		role: row.role,
	};
}

async function findByUsername(username) {
	const [rows] = await pool.query(
		'\
		SELECT id, username, password_hash, role\
		FROM users WHERE username = ? LIMIT 1\
		',
		[username]
	);

	return mapRow(rows[0]);
}

module.exports = {
	findByUsername,
};
