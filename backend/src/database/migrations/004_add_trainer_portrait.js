module.exports = {
	up: async (db) => {
		const [columns] = await db.query("SHOW COLUMNS FROM trainers LIKE 'portrait_url'");
		if (columns.length > 0) {
			return;
		}

		await db.query('ALTER TABLE trainers ADD COLUMN portrait_url VARCHAR(255) DEFAULT NULL AFTER bio;');
	},

	down: async (db) => {
		const [columns] = await db.query("SHOW COLUMNS FROM trainers LIKE 'portrait_url'");
		if (columns.length === 0) {
			return;
		}

		await db.query('ALTER TABLE trainers DROP COLUMN portrait_url;');
	},
};
