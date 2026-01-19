const pool = require('../database/pool');

const BASE_SELECT = `
	SELECT
		id,
		national_dex,
		name,
		height,
		weight,
		base_experience,
		sprite_url,
		types_json,
		abilities_json,
		stats_json,
		trainer_id,
		created_at,
		updated_at
	FROM pokemon
`;

function safeParse(json, fallback = []) {
	if (json === null || json === undefined) {
		return fallback;
	}

	if (Array.isArray(json) || typeof json === 'object') {
		return json;
	}

	let payload = json;
	if (Buffer.isBuffer(json)) {
		payload = json.toString('utf8');
	}

	if (typeof payload === 'string') {
		try {
			return JSON.parse(payload);
		} catch (error) {
			console.warn('Failed to parse JSON column', error);
			return fallback;
		}
	}

	return fallback;
}

function mapRow(row) {
	if (!row) return null;
	return {
		id: row.id,
		nationalDex: row.national_dex,
		name: row.name,
		height: row.height,
		weight: row.weight,
		baseExperience: row.base_experience,
		spriteUrl: row.sprite_url,
		types: safeParse(row.types_json, []),
		abilities: safeParse(row.abilities_json, []),
		stats: safeParse(row.stats_json, []),
		trainerId: row.trainer_id,
		createdAt: row.created_at,
		updatedAt: row.updated_at,
	};
}

function buildDbPayload(pokemon) {
	return {
		nationalDex: pokemon.nationalDex,
		name: pokemon.name,
		height: pokemon.height ?? null,
		weight: pokemon.weight ?? null,
		baseExperience: pokemon.baseExperience ?? null,
		spriteUrl: pokemon.spriteUrl ?? null,
		typesJson: JSON.stringify(pokemon.types ?? []),
		abilitiesJson: JSON.stringify(pokemon.abilities ?? []),
		statsJson: JSON.stringify(pokemon.stats ?? []),
		trainerId: pokemon.trainerId ?? null,
	};
}

async function findAll({ search, types = [], limit = 151, offset = 0 } = {}) {
	const clauses = [];
	const params = [];

	if (search) {
		clauses.push('name LIKE ?');
		params.push(`%${search}%`);
	}

	if (types.length) {
		const typeClauses = types.map(() => "JSON_CONTAINS(types_json, JSON_QUOTE(?), '$')");
		clauses.push(`(${typeClauses.join(' AND ')})`);
		params.push(...types.map((typeName) => typeName.toLowerCase()));
	}

	let sql = BASE_SELECT;
	if (clauses.length) {
		sql += ` WHERE ${clauses.join(' AND ')}`;
	}

	sql += ' ORDER BY national_dex ASC LIMIT ? OFFSET ?';
	params.push(Number(limit), Number(offset));

	const [rows] = await pool.query(sql, params);
	return rows.map(mapRow);
}

async function findByNationalDex(nationalDex) {
	const [rows] = await pool.query(`${BASE_SELECT} WHERE national_dex = ? LIMIT 1`, [nationalDex]);
	return mapRow(rows[0]);
}

async function create(pokemon) {
	const payload = buildDbPayload(pokemon);
	await pool.execute(
		`INSERT INTO pokemon (
			national_dex,
			name,
			height,
			weight,
			base_experience,
			sprite_url,
			types_json,
			abilities_json,
			stats_json,
			trainer_id,
			created_at,
			updated_at
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
		[
			payload.nationalDex,
			payload.name,
			payload.height,
			payload.weight,
			payload.baseExperience,
			payload.spriteUrl,
			payload.typesJson,
			payload.abilitiesJson,
			payload.statsJson,
			payload.trainerId,
		]
	);
	return findByNationalDex(payload.nationalDex);
}

async function updateByNationalDex(nationalDex, pokemon) {
	const payload = buildDbPayload(pokemon);
	await pool.execute(
		`UPDATE pokemon SET
			national_dex = ?,
			name = ?,
			height = ?,
			weight = ?,
			base_experience = ?,
			sprite_url = ?,
			types_json = ?,
			abilities_json = ?,
			stats_json = ?,
			trainer_id = ?,
			updated_at = NOW()
		WHERE national_dex = ?`,
		[
			payload.nationalDex,
			payload.name,
			payload.height,
			payload.weight,
			payload.baseExperience,
			payload.spriteUrl,
			payload.typesJson,
			payload.abilitiesJson,
			payload.statsJson,
			payload.trainerId,
			nationalDex,
		]
	);
	return findByNationalDex(payload.nationalDex);
}

async function removeByNationalDex(nationalDex) {
	const [result] = await pool.execute('DELETE FROM pokemon WHERE national_dex = ?', [nationalDex]);
	return result.affectedRows > 0;
}

module.exports = {
	findAll,
	findByNationalDex,
	create,
	updateByNationalDex,
	removeByNationalDex,
};
