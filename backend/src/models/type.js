const pool = require('../database/pool');

function mapRow(row) {
	if (!row) return null;
	return {
		id: row.id,
		name: row.name,
		color: row.color,
		description: row.description,
		createdAt: row.created_at,
		updatedAt: row.updated_at,
	};
}

async function findAll() {
	const [rows] = await pool.query('SELECT id, name, color, description, created_at, updated_at FROM types ORDER BY name ASC');
	return rows.map(mapRow);
}

async function findById(id) {
	const [rows] = await pool.query(
		'SELECT id, name, color, description, created_at, updated_at FROM types WHERE id = ? LIMIT 1',
		[id]
	);
	return mapRow(rows[0]);
}

async function findByName(name) {
	const [rows] = await pool.query('SELECT id, name, color, description, created_at, updated_at FROM types WHERE name = ? LIMIT 1', [name]);
	return mapRow(rows[0]);
}

async function create({ name, color, description }) {
	const [result] = await pool.execute(
		'INSERT INTO types (name, color, description, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())',
		[name, color ?? null, description ?? null]
	);
	return findById(result.insertId);
}

async function update(id, { name, color, description }) {
	await pool.execute(
		'UPDATE types SET name = ?, color = ?, description = ?, updated_at = NOW() WHERE id = ?',
		[name, color ?? null, description ?? null, id]
	);
	return findById(id);
}

async function remove(id) {
	const [result] = await pool.execute('DELETE FROM types WHERE id = ?', [id]);
	return result.affectedRows > 0;
}

module.exports = {
	findAll,
	findById,
	findByName,
	create,
	update,
	remove,
};
