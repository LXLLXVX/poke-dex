const { fetchAndPersistGenerationOne } = require('../../services/pokeApiImporter');

const INSERT_SQL = `
	INSERT INTO pokemon (
		national_dex,
		name,
		height,
		weight,
		base_experience,
		sprite_url,
		types_json,
		abilities_json,
		stats_json
	) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
	ON DUPLICATE KEY UPDATE
		name = VALUES(name),
		height = VALUES(height),
		weight = VALUES(weight),
		base_experience = VALUES(base_experience),
		sprite_url = VALUES(sprite_url),
		types_json = VALUES(types_json),
		abilities_json = VALUES(abilities_json),
		stats_json = VALUES(stats_json);
`;

module.exports = {
	seed: async (db) => {
		const saveFn = async (entries) => {
			for (const pokemon of entries) {
				await db.execute(INSERT_SQL, [
					pokemon.nationalDex,
					pokemon.name,
					pokemon.height ?? null,
					pokemon.weight ?? null,
					pokemon.baseExperience ?? null,
					pokemon.sprite ?? null,
					JSON.stringify(pokemon.types),
					JSON.stringify(pokemon.abilities),
					JSON.stringify(pokemon.stats),
				]);
			}
		};

		const total = await fetchAndPersistGenerationOne(saveFn, { batchSize: 25 });
		console.info(`[seed] Persisted ${total} Generation I Pokemon`);
	},
};
