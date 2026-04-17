module.exports = {
	up: async (db) => {
		const createTableSql = `
			CREATE TABLE IF NOT EXISTS users (
				id INT UNSIGNED NOT NULL AUTO_INCREMENT,
				username VARCHAR(80) NOT NULL,
				password_hash VARCHAR(255) NOT NULL,
				role ENUM('admin', 'trainer') NOT NULL DEFAULT 'trainer',
				created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
				updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
				PRIMARY KEY (id),
				UNIQUE KEY unique_user_username (username)
			) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
		`;

		await db.query(createTableSql);
	},

	down: async (db) => {
		await db.query('DROP TABLE IF EXISTS users;');
	},
};
