const { Type } = require('../database/ormModels');

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
	const rows = await Type.findAll({ order: [['name', 'ASC']] });
	return rows.map((entry) => mapRow(entry.get({ plain: true })));
}

async function findById(id) {
	const row = await Type.findByPk(id);
	return mapRow(row?.get({ plain: true }));
}

async function findByName(name) {
	const row = await Type.findOne({ where: { name } });
	return mapRow(row?.get({ plain: true }));
}

async function create({ name, color, description }) {
	const row = await Type.create({
		name,
		color: color ?? null,
		description: description ?? null,
	});
	return mapRow(row.get({ plain: true }));
}

async function update(id, { name, color, description }) {
	const row = await Type.findByPk(id);
	if (!row) return null;

	await row.update({
		name,
		color: color ?? null,
		description: description ?? null,
	});

	return mapRow(row.get({ plain: true }));
}

async function remove(id) {
	const deletedCount = await Type.destroy({ where: { id } });
	return deletedCount > 0;
}

module.exports = {
	findAll,
	findById,
	findByName,
	create,
	update,
	remove,
};
