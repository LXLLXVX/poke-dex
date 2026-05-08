const { Trainer } = require('../database/ormModels');

function mapRow(row) {
	if (!row) return null;
	return {
		id: row.id,
		name: row.name,
		hometown: row.hometown,
		badgeCount: row.badgeCount,
		bio: row.bio,
		portraitUrl: row.portraitUrl,
		createdAt: row.createdAt,
		updatedAt: row.updatedAt,
	};
}

async function findAll() {
	const rows = await Trainer.findAll({ order: [['name', 'ASC']] });
	return rows.map((entry) => mapRow(entry.get({ plain: true })));
}

async function findById(id) {
	const row = await Trainer.findByPk(id);
	return mapRow(row?.get({ plain: true }));
}

async function create({ name, hometown, badgeCount, bio, portraitUrl }) {
	const row = await Trainer.create({
		name,
		hometown: hometown ?? null,
		badgeCount: badgeCount ?? 0,
		bio: bio ?? null,
		portraitUrl: portraitUrl ?? null,
	});

	return mapRow(row.get({ plain: true }));
}

async function update(id, { name, hometown, badgeCount, bio, portraitUrl }) {
	const row = await Trainer.findByPk(id);
	if (!row) return null;

	await row.update({
		name,
		hometown: hometown ?? null,
		badgeCount: badgeCount ?? 0,
		bio: bio ?? null,
		portraitUrl: portraitUrl ?? null,
	});

	return mapRow(row.get({ plain: true }));
}

async function remove(id) {
	const deletedCount = await Trainer.destroy({ where: { id } });
	return deletedCount > 0;
}

module.exports = {
	findAll,
	findById,
	create,
	update,
	remove,
};
