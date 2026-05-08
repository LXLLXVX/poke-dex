const { Pokemon, TeamMember } = require('../database/ormModels');

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
	const pokemon = row.pokemon;
	const pokemonTypes = pokemon ? safeParse(pokemon.typesJson, []) : [];
	return {
		id: row.id,
		nationalDex: row.nationalDex,
		nickname: row.nickname,
		role: row.role,
		notes: row.notes,
		createdAt: row.createdAt,
		updatedAt: row.updatedAt,
		pokemon: pokemon
			? {
				name: pokemon.name,
				spriteUrl: pokemon.spriteUrl,
				types: pokemonTypes,
			}
			: null,
	};
}

async function findAll() {
	const rows = await TeamMember.findAll({
		include: [{ model: Pokemon, as: 'pokemon', attributes: ['name', 'spriteUrl', 'typesJson'] }],
		order: [['createdAt', 'ASC']],
	});

	return rows.map((entry) => mapRow(entry.get({ plain: true })));
}

async function countAll() {
	return TeamMember.count();
}

async function findById(id) {
	const row = await TeamMember.findByPk(id, {
		include: [{ model: Pokemon, as: 'pokemon', attributes: ['name', 'spriteUrl', 'typesJson'] }],
	});

	return mapRow(row?.get({ plain: true }));
}

async function findByNationalDex(nationalDex) {
	const row = await TeamMember.findOne({
		where: { nationalDex },
		include: [{ model: Pokemon, as: 'pokemon', attributes: ['name', 'spriteUrl', 'typesJson'] }],
	});

	return mapRow(row?.get({ plain: true }));
}

async function create(member) {
	const row = await TeamMember.create({
		nationalDex: member.nationalDex,
		nickname: member.nickname ?? null,
		role: member.role ?? null,
		notes: member.notes ?? null,
	});

	return findById(row.id);
}

async function update(id, member) {
	const row = await TeamMember.findByPk(id);
	if (!row) return null;

	await row.update({
		nationalDex: member.nationalDex,
		nickname: member.nickname ?? null,
		role: member.role ?? null,
		notes: member.notes ?? null,
	});

	return findById(id);
}

async function remove(id) {
	const deletedCount = await TeamMember.destroy({ where: { id } });
	return deletedCount > 0;
}

module.exports = {
	findAll,
	findById,
	findByNationalDex,
	countAll,
	create,
	update,
	remove,
};
