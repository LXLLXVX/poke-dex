module.exports = {
	up: async (db) => {
		const createTableSql = `
			CREATE TABLE IF NOT EXISTS pokemon (
				id INT UNSIGNED NOT NULL AUTO_INCREMENT,
				national_dex INT UNSIGNED NOT NULL UNIQUE,
				name VARCHAR(80) NOT NULL,
				height SMALLINT UNSIGNED DEFAULT NULL,
				weight SMALLINT UNSIGNED DEFAULT NULL,
				base_experience SMALLINT UNSIGNED DEFAULT NULL,
				sprite_url VARCHAR(255) DEFAULT NULL,
				types_json JSON NOT NULL,
				abilities_json JSON NOT NULL,
				stats_json JSON NOT NULL,
				trainer_id INT UNSIGNED DEFAULT NULL,
				created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
				updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
				PRIMARY KEY (id),
				CONSTRAINT fk_pokemon_trainer FOREIGN KEY (trainer_id)
					REFERENCES trainers(id) ON DELETE SET NULL ON UPDATE CASCADE
			) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
		`;

		await db.query(createTableSql);
	},

	down: async (db) => {
		await db.query('DROP TABLE IF EXISTS pokemon;');
	},
};
