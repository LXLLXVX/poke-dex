const pool = require('../database/pool');

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
		nickname: row.nickname,
		role: row.role,
		notes: row.notes,
		createdAt: row.created_at,
		updatedAt: row.updated_at,
		pokemon: row.pokemon_name
			? {
				name: row.pokemon_name,
				spriteUrl: row.pokemon_sprite_url,
				types: safeParse(row.pokemon_types_json, []),
			}
			: null,
	};
}

async function findAll() {
	const [rows] = await pool.query(
		`
			SELECT
				tm.id,
				tm.national_dex,
				tm.nickname,
				tm.role,
				tm.notes,
				tm.created_at,
				tm.updated_at,
				p.name AS pokemon_name,
				p.sprite_url AS pokemon_sprite_url,
				p.types_json AS pokemon_types_json
			FROM team_members tm
			LEFT JOIN pokemon p ON p.national_dex = tm.national_dex
			ORDER BY tm.created_at ASC
		`
	);
	return rows.map(mapRow);
}

async function countAll() {
	const [rows] = await pool.query('SELECT COUNT(*) as total FROM team_members');
	return rows[0]?.total ?? 0;
}

async function findById(id) {
	const [rows] = await pool.query(
		`
			SELECT
				tm.id,
				tm.national_dex,
				tm.nickname,
				tm.role,
				tm.notes,
				tm.created_at,
				tm.updated_at,
				p.name AS pokemon_name,
				p.sprite_url AS pokemon_sprite_url,
				p.types_json AS pokemon_types_json
			FROM team_members tm
			LEFT JOIN pokemon p ON p.national_dex = tm.national_dex
			WHERE tm.id = ?
			LIMIT 1
		`,
		[id]
	);
	return mapRow(rows[0]);
}

async function create(member) {
	const [result] = await pool.execute(
		`
			INSERT INTO team_members (
				national_dex,
				nickname,
				role,
				notes,
				created_at,
				updated_at
			) VALUES (?, ?, ?, ?, NOW(), NOW())
		`,
		[member.nationalDex, member.nickname ?? null, member.role ?? null, member.notes ?? null]
	);
	return findById(result.insertId);
}

async function update(id, member) {
	await pool.execute(
		`
			UPDATE team_members SET
				national_dex = ?,
				nickname = ?,
				role = ?,
				notes = ?,
				updated_at = NOW()
			WHERE id = ?
		`,
		[member.nationalDex, member.nickname ?? null, member.role ?? null, member.notes ?? null, id]
	);
	return findById(id);
}

async function remove(id) {
	const [result] = await pool.execute('DELETE FROM team_members WHERE id = ?', [id]);
	return result.affectedRows > 0;
}

module.exports = {
	findAll,
	findById,
	countAll,
	create,
	update,
	remove,
};
