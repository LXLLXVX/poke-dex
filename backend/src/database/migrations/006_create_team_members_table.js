module.exports = {
	up: async (db) => {
		const createTableSql = `
			CREATE TABLE IF NOT EXISTS team_members (
				id INT UNSIGNED NOT NULL AUTO_INCREMENT,
				national_dex INT UNSIGNED NOT NULL,
				nickname VARCHAR(80) DEFAULT NULL,
				role VARCHAR(60) DEFAULT NULL,
				notes VARCHAR(255) DEFAULT NULL,
				created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
				updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
				PRIMARY KEY (id),
				CONSTRAINT fk_team_members_pokemon FOREIGN KEY (national_dex)
					REFERENCES pokemon(national_dex) ON DELETE CASCADE ON UPDATE CASCADE
			) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
		`;

		await db.query(createTableSql);
	},

	down: async (db) => {
		await db.query('DROP TABLE IF EXISTS team_members;');
	},
};
