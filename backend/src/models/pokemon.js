const { Op, fn, col, where } = require('sequelize');
const { Pokemon } = require('../database/ormModels');

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
		nationalDex: row.nationalDex,
		name: row.name,
		height: row.height,
		weight: row.weight,
		baseExperience: row.baseExperience,
		spriteUrl: row.spriteUrl,
		types: safeParse(row.typesJson, []),
		abilities: safeParse(row.abilitiesJson, []),
		stats: safeParse(row.statsJson, []),
		trainerId: row.trainerId,
		createdAt: row.createdAt,
		updatedAt: row.updatedAt,
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
		typesJson: pokemon.types ?? [],
		abilitiesJson: pokemon.abilities ?? [],
		statsJson: pokemon.stats ?? [],
		trainerId: pokemon.trainerId ?? null,
	};
}

async function findAll({ search, types = [], limit = 151, offset = 0 } = {}) {
	const filters = {};

	if (search) {
		filters.name = { [Op.like]: `%${search}%` };
	}

	if (types.length) {
		filters[Op.and] = types.map((typeName) =>
			where(fn('JSON_CONTAINS', col('types_json'), fn('JSON_QUOTE', String(typeName).toLowerCase()), '$'), 1)
		);
	}

	const rows = await Pokemon.findAll({
		where: filters,
		order: [['nationalDex', 'ASC']],
		limit: Number(limit),
		offset: Number(offset),
	});

	return rows.map((entry) => mapRow(entry.get({ plain: true })));
}

async function findByNationalDex(nationalDex) {
	const row = await Pokemon.findOne({ where: { nationalDex } });
	return mapRow(row?.get({ plain: true }));
}

async function create(pokemon) {
	const payload = buildDbPayload(pokemon);
	const row = await Pokemon.create(payload);
	return mapRow(row.get({ plain: true }));
}

async function updateByNationalDex(nationalDex, pokemon) {
	const payload = buildDbPayload(pokemon);
	const row = await Pokemon.findOne({ where: { nationalDex } });
	if (!row) return null;

	await row.update(payload);
	return mapRow(row.get({ plain: true }));
}

async function removeByNationalDex(nationalDex) {
	const deletedCount = await Pokemon.destroy({ where: { nationalDex } });
	return deletedCount > 0;
}

module.exports = {
	findAll,
	findByNationalDex,
	create,
	updateByNationalDex,
	removeByNationalDex,
};
