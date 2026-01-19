module.exports = {
	up: async (db) => {
		const createTableSql = `
			CREATE TABLE IF NOT EXISTS trainers (
				id INT UNSIGNED NOT NULL AUTO_INCREMENT,
				name VARCHAR(80) NOT NULL,
				hometown VARCHAR(120) DEFAULT NULL,
				badge_count TINYINT UNSIGNED DEFAULT 0,
				bio TEXT DEFAULT NULL,
				created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
				updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
				PRIMARY KEY (id)
			) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
		`;

		await db.query(createTableSql);
	},

	down: async (db) => {
		await db.query('DROP TABLE IF EXISTS trainers;');
	},
};
