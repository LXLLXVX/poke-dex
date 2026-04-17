const bcrypt = require('bcryptjs');

const USERS = [
	{ username: 'admin', password: 'admin123', role: 'admin' },
	{ username: 'misty', password: 'misty123', role: 'trainer' },
];

module.exports = {
	seed: async (db) => {
		await db.query('DELETE FROM users');

		const insertSql = `
			INSERT INTO users (username, password_hash, role)
			VALUES (?, ?, ?)
			ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), role = VALUES(role);
		`;

		for (const user of USERS) {
			const passwordHash = await bcrypt.hash(user.password, 10);
			await db.execute(insertSql, [user.username, passwordHash, user.role]);
		}
	},
};
