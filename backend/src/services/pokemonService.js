const pokemonModel = require('../models/pokemon');
const { httpError } = require('../utils/httpError');

function normalizeTypeFilters(singleType, multiTypes) {
	const bucket = [];

	if (singleType) {
		bucket.push(String(singleType));
	}

	if (Array.isArray(multiTypes)) {
		bucket.push(...multiTypes);
	} else if (typeof multiTypes === 'string') {
		bucket.push(multiTypes);
	}

	return bucket
		.map((type) => type.trim().toLowerCase())
		.filter((type) => type.length > 0);
}

async function listPokemon(filters = {}) {
	const limit = Number(filters.limit || 151);
	const offset = Number(filters.offset || 0);
	const types = normalizeTypeFilters(filters.type, filters.types);

	return pokemonModel.findAll({
		search: filters.search,
		types,
		limit,
		offset,
	});
}

async function getPokemonByNationalDex(nationalDex) {
	return pokemonModel.findByNationalDex(Number(nationalDex));
}

function sanitizeString(value) {
	return typeof value === 'string' ? value.trim() : '';
}

function parseNullableNumber(value) {
	if (value === null || value === undefined || value === '') {
		return null;
	}
	const parsed = Number(value);
	return Number.isNaN(parsed) ? null : parsed;
}

function normalizeTypes(value) {
	const list = [];
	if (Array.isArray(value)) {
		for (const entry of value) {
			const normalized = sanitizeString(entry).toLowerCase();
			if (normalized) {
				list.push(normalized);
			}
		}
	} else if (typeof value === 'string') {
		const normalized = value
			.split(',')
			.map((token) => token.trim().toLowerCase())
			.filter(Boolean);
		list.push(...normalized);
	}

	if (!list.length) {
		throw httpError(400, 'At least one Pokémon type is required');
	}

	return list;
}

function normalizeAbilities(value) {
	if (!Array.isArray(value)) {
		return [];
	}

	return value
		.map((entry) => ({
			name: sanitizeString(entry?.name).toLowerCase() || null,
			isHidden: Boolean(entry?.isHidden || entry?.is_hidden),
		}))
		.filter((entry) => entry.name);
}

function normalizeStats(value) {
	if (!Array.isArray(value)) {
		return [];
	}

	return value
		.map((entry) => ({
			name: sanitizeString(entry?.name).toLowerCase() || null,
			base: Number(entry?.base ?? entry?.base_stat ?? 0) || 0,
		}))
		.filter((entry) => entry.name);
}

function normalizePokemonPayload(payload) {
	const nationalDex = Number(payload.nationalDex ?? payload.national_dex);
	if (!Number.isInteger(nationalDex) || nationalDex <= 0) {
		throw httpError(400, 'nationalDex must be a positive integer');
	}

	const name = sanitizeString(payload.name);
	if (!name) {
		throw httpError(400, 'Pokémon name is required');
	}

	const spriteUrl = sanitizeString(payload.spriteUrl ?? payload.sprite_url);
	if (!spriteUrl) {
		throw httpError(400, 'spriteUrl is required');
	}

	const height = parseNullableNumber(payload.height);
	const weight = parseNullableNumber(payload.weight);
	const baseExperience = parseNullableNumber(payload.baseExperience ?? payload.base_experience);
	const trainerIdRaw = parseNullableNumber(payload.trainerId ?? payload.trainer_id);

	return {
		nationalDex,
		name,
		height,
		weight,
		baseExperience,
		spriteUrl,
		types: normalizeTypes(payload.types),
		abilities: normalizeAbilities(payload.abilities),
		stats: normalizeStats(payload.stats),
		trainerId: trainerIdRaw,
	};
}

async function createPokemon(payload) {
	const normalized = normalizePokemonPayload(payload);
	return pokemonModel.create(normalized);
}

async function updatePokemon(nationalDexParam, payload) {
	const nationalDex = Number(nationalDexParam);
	if (!Number.isInteger(nationalDex)) {
		throw httpError(400, 'nationalDex must be numeric');
	}

	const existing = await pokemonModel.findByNationalDex(nationalDex);
	if (!existing) {
		throw httpError(404, 'Pokémon not found');
	}

	const normalized = normalizePokemonPayload({
		nationalDex: payload.nationalDex ?? nationalDex,
		name: payload.name ?? existing.name,
		height: payload.height ?? existing.height,
		weight: payload.weight ?? existing.weight,
		baseExperience: payload.baseExperience ?? existing.baseExperience,
		spriteUrl: payload.spriteUrl ?? existing.spriteUrl,
		types: payload.types ?? existing.types,
		abilities: payload.abilities ?? existing.abilities,
		stats: payload.stats ?? existing.stats,
		trainerId: payload.trainerId ?? existing.trainerId,
	});

	return pokemonModel.updateByNationalDex(nationalDex, normalized);
}

async function deletePokemon(nationalDexParam) {
	const nationalDex = Number(nationalDexParam);
	if (!Number.isInteger(nationalDex)) {
		throw httpError(400, 'nationalDex must be numeric');
	}

	const removed = await pokemonModel.removeByNationalDex(nationalDex);
	if (!removed) {
		throw httpError(404, 'Pokémon not found');
	}
}

module.exports = {
	listPokemon,
	getPokemonByNationalDex,
	createPokemon,
	updatePokemon,
	deletePokemon,
};
