const teamMemberModel = require('../models/teamMember');
const pokemonModel = require('../models/pokemon');
const { httpError } = require('../utils/httpError');

const MAX_TEAM_SIZE = 6;
const MAX_NOTES_LENGTH = 255;

function sanitizeString(value) {
	return typeof value === 'string' ? value.trim() : '';
}

async function requirePokemonByDex(nationalDex) {
	const numeric = Number(nationalDex);
	if (!Number.isInteger(numeric) || numeric <= 0) {
		throw httpError(400, 'nationalDex must be a positive integer');
	}

	if (numeric > 151) {
		throw httpError(400, 'Team builder currently supports only the original 151 Pokémon');
	}

	const pokemon = await pokemonModel.findByNationalDex(numeric);
	if (!pokemon) {
		throw httpError(400, 'Pokémon not found in local Pokédex');
	}

	return numeric;
}

function clampNotes(value) {
	if (!value) return null;
	return value.slice(0, MAX_NOTES_LENGTH);
}

async function normalizePayload(payload, existing = null) {
	const result = { ...existing };

	const nationalDexInput = payload?.nationalDex ?? payload?.national_dex ?? existing?.nationalDex;
	if (nationalDexInput === undefined || nationalDexInput === null) {
		throw httpError(400, 'nationalDex is required');
	}
	result.nationalDex = await requirePokemonByDex(nationalDexInput);

	const nickname = sanitizeString(payload?.nickname ?? existing?.nickname ?? '');
	result.nickname = nickname || null;

	const role = sanitizeString(payload?.role ?? existing?.role ?? '');
	result.role = role || null;

	const notes = sanitizeString(payload?.notes ?? existing?.notes ?? '');
	result.notes = clampNotes(notes) || null;

	return result;
}

async function listTeam() {
	return teamMemberModel.findAll();
}

async function addMember(payload) {
	const count = await teamMemberModel.countAll();
	if (count >= MAX_TEAM_SIZE) {
		throw httpError(400, 'Team is already full (max 6 Pokémon)');
	}

	const normalized = await normalizePayload(payload);
	return teamMemberModel.create(normalized);
}

async function updateMember(id, payload) {
	const numericId = Number(id);
	if (!Number.isInteger(numericId) || numericId <= 0) {
		throw httpError(400, 'Team member id must be numeric');
	}

	const existing = await teamMemberModel.findById(numericId);
	if (!existing) {
		throw httpError(404, 'Team member not found');
	}

	const normalized = await normalizePayload(payload, existing);
	return teamMemberModel.update(numericId, normalized);
}

async function removeMember(id) {
	const numericId = Number(id);
	if (!Number.isInteger(numericId) || numericId <= 0) {
		throw httpError(400, 'Team member id must be numeric');
	}

	const removed = await teamMemberModel.remove(numericId);
	if (!removed) {
		throw httpError(404, 'Team member not found');
	}
}

module.exports = {
	listTeam,
	addMember,
	updateMember,
	removeMember,
};
