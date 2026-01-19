module.exports = {
	up: async (db) => {
		const [indexes] = await db.query("SHOW INDEX FROM trainers WHERE Key_name = 'unique_trainer_name'");
		if (indexes.length) {
			return;
		}

		await db.query(`
			DELETE t1 FROM trainers t1
			INNER JOIN trainers t2
			WHERE t1.name = t2.name AND t1.id > t2.id;
		`);

		await db.query('ALTER TABLE trainers ADD UNIQUE KEY unique_trainer_name (name)');
	},

	down: async (db) => {
		const [indexes] = await db.query("SHOW INDEX FROM trainers WHERE Key_name = 'unique_trainer_name'");
		if (!indexes.length) {
			return;
		}

		await db.query('ALTER TABLE trainers DROP INDEX unique_trainer_name');
	},
};
