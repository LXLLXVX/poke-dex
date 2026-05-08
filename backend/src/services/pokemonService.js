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

function parseBoundedInt(value, fieldName, { min, max, nullable = false } = {}) {
	if (value === undefined || value === null || value === '') {
		if (nullable) return null;
		throw httpError(400, `${fieldName} is required`);
	}

	const parsed = Number(value);
	if (!Number.isInteger(parsed)) {
		throw httpError(400, `${fieldName} must be an integer`);
	}
	if (min !== undefined && parsed < min) {
		throw httpError(400, `${fieldName} must be >= ${min}`);
	}
	if (max !== undefined && parsed > max) {
		throw httpError(400, `${fieldName} must be <= ${max}`);
	}
	return parsed;
}

function isValidHttpUrl(value) {
	try {
		const parsed = new URL(value);
		return parsed.protocol === 'http:' || parsed.protocol === 'https:';
	} catch {
		return false;
	}
}

async function listPokemon(filters = {}) {
	const limit = parseBoundedInt(filters.limit ?? 151, 'limit', { min: 1, max: 151 });
	const offset = parseBoundedInt(filters.offset ?? 0, 'offset', { min: 0, max: 10000 });
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

	const deduped = [...new Set(list)];

	if (!deduped.length) {
		throw httpError(400, 'At least one Pokémon type is required');
	}
	if (deduped.length > 2) {
		throw httpError(400, 'A Pokémon can have at most 2 types');
	}
	for (const typeName of deduped) {
		if (!/^[a-z-]{3,20}$/.test(typeName)) {
			throw httpError(400, `Invalid type: ${typeName}`);
		}
	}

	return deduped;
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
		.filter((entry) => entry.name)
		.map((entry) => {
			if (!/^[a-z-]{2,40}$/.test(entry.name)) {
				throw httpError(400, `Invalid ability name: ${entry.name}`);
			}
			return entry;
		});
}

function normalizeStats(value) {
	if (!Array.isArray(value)) {
		return [];
	}

	return value
		.map((entry) => ({
			name: sanitizeString(entry?.name).toLowerCase() || null,
			base: Number(entry?.base ?? entry?.base_stat ?? 0),
		}))
		.filter((entry) => entry.name)
		.map((entry) => {
			if (!/^[a-z-]{2,40}$/.test(entry.name)) {
				throw httpError(400, `Invalid stat name: ${entry.name}`);
			}
			if (!Number.isFinite(entry.base) || entry.base < 1 || entry.base > 255) {
				throw httpError(400, `Invalid stat base value for ${entry.name}`);
			}
			return { ...entry, base: Math.trunc(entry.base) };
		});
}

function normalizePokemonPayload(payload) {
	const nationalDex = parseBoundedInt(payload.nationalDex ?? payload.national_dex, 'nationalDex', { min: 1, max: 151 });

	const name = sanitizeString(payload.name);
	if (!name) {
		throw httpError(400, 'Pokémon name is required');
	}
	if (name.length < 2 || name.length > 80) {
		throw httpError(400, 'Pokémon name must have between 2 and 80 characters');
	}
	if (!/^[a-zA-Z0-9 .'-]+$/.test(name)) {
		throw httpError(400, 'Pokémon name contains invalid characters');
	}

	const spriteUrl = sanitizeString(payload.spriteUrl ?? payload.sprite_url);
	if (!spriteUrl) {
		throw httpError(400, 'spriteUrl is required');
	}
	if (!isValidHttpUrl(spriteUrl)) {
		throw httpError(400, 'spriteUrl must be a valid http/https URL');
	}
	if (spriteUrl.length > 255) {
		throw httpError(400, 'spriteUrl cannot exceed 255 characters');
	}

	const height = parseBoundedInt(payload.height, 'height', { min: 1, max: 999, nullable: true });
	const weight = parseBoundedInt(payload.weight, 'weight', { min: 1, max: 9999, nullable: true });
	const baseExperience = parseBoundedInt(payload.baseExperience ?? payload.base_experience, 'baseExperience', {
		min: 1,
		max: 999,
		nullable: true,
	});
	const trainerIdRaw = parseBoundedInt(payload.trainerId ?? payload.trainer_id, 'trainerId', {
		min: 1,
		max: 1000000,
		nullable: true,
	});

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
