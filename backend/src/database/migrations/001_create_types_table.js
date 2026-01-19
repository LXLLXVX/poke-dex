module.exports = {
	up: async (db) => {
		const createTableSql = `
			CREATE TABLE IF NOT EXISTS types (
				id INT UNSIGNED NOT NULL AUTO_INCREMENT,
				name VARCHAR(40) NOT NULL UNIQUE,
				color VARCHAR(20) DEFAULT NULL,
				description TEXT DEFAULT NULL,
				created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
				updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
				PRIMARY KEY (id)
			) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
		`;

		await db.query(createTableSql);
	},

	down: async (db) => {
		await db.query('DROP TABLE IF EXISTS types;');
	},
};
