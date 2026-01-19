const pool = require('../database/pool');

function mapRow(row) {
	if (!row) return null;
	return {
		id: row.id,
		name: row.name,
		hometown: row.hometown,
		badgeCount: row.badge_count,
		bio: row.bio,
		portraitUrl: row.portrait_url,
		createdAt: row.created_at,
		updatedAt: row.updated_at,
	};
}

async function findAll() {
	const [rows] = await pool.query(
		'\
		SELECT id, name, hometown, badge_count, bio, portrait_url, created_at, updated_at\
		FROM trainers\
		ORDER BY name ASC\
		'
	);
	return rows.map(mapRow);
}

async function findById(id) {
	const [rows] = await pool.query(
		'\
		SELECT id, name, hometown, badge_count, bio, portrait_url, created_at, updated_at\
		FROM trainers WHERE id = ? LIMIT 1\
		',
		[id]
	);
	return mapRow(rows[0]);
}

async function create({ name, hometown, badgeCount, bio, portraitUrl }) {
	const [result] = await pool.execute(
		'\
		INSERT INTO trainers (name, hometown, badge_count, bio, portrait_url, created_at, updated_at)\
		VALUES (?, ?, ?, ?, ?, NOW(), NOW())\
		',
		[name, hometown ?? null, badgeCount ?? 0, bio ?? null, portraitUrl ?? null]
	);
	return findById(result.insertId);
}

async function update(id, { name, hometown, badgeCount, bio, portraitUrl }) {
	await pool.execute(
		'\
		UPDATE trainers\
		SET name = ?, hometown = ?, badge_count = ?, bio = ?, portrait_url = ?, updated_at = NOW()\
		WHERE id = ?\
		',
		[name, hometown ?? null, badgeCount ?? 0, bio ?? null, portraitUrl ?? null, id]
	);
	return findById(id);
}

async function remove(id) {
	const [result] = await pool.execute('DELETE FROM trainers WHERE id = ?', [id]);
	return result.affectedRows > 0;
}

module.exports = {
	findAll,
	findById,
	create,
	update,
	remove,
};
