const typeModel = require('../models/type');
const { httpError } = require('../utils/httpError');

function sanitizeString(value) {
	return typeof value === 'string' ? value.trim() : '';
}

function isValidHexColor(value) {
	return /^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/.test(value);
}

function isValidColorKeyword(value) {
	return /^[a-zA-Z]{3,20}$/.test(value);
}

function normalizeTypePayload(payload) {
	const name = sanitizeString(payload.name).toLowerCase();
	if (!name) {
		throw httpError(400, 'Type name is required');
	}
	if (name.length < 3 || name.length > 40) {
		throw httpError(400, 'Type name must have between 3 and 40 characters');
	}
	if (!/^[a-z-]+$/.test(name)) {
		throw httpError(400, 'Type name must contain only letters and hyphen');
	}

	const color = sanitizeString(payload.color);
	if (color && !(isValidHexColor(color) || isValidColorKeyword(color))) {
		throw httpError(400, 'Color must be a valid hex code or CSS keyword');
	}
	if (color.length > 20) {
		throw httpError(400, 'Color value cannot exceed 20 characters');
	}

	const description = sanitizeString(payload.description);
	if (description.length > 1000) {
		throw httpError(400, 'Description cannot exceed 1000 characters');
	}

	return {
		name,
		color: color || null,
		description: description || null,
	};
}

async function listTypes() {
	return typeModel.findAll();
}

async function createType(payload) {
	const normalized = normalizeTypePayload(payload);
	const existing = await typeModel.findByName(normalized.name);
	if (existing) {
		throw httpError(409, 'Type name already exists');
	}
	return typeModel.create(normalized);
}

async function updateType(id, payload) {
	const typeId = Number(id);
	if (Number.isNaN(typeId)) {
		throw httpError(400, 'Type id must be numeric');
	}

	const existing = await typeModel.findById(typeId);
	if (!existing) {
		throw httpError(404, 'Type not found');
	}

	const normalized = normalizeTypePayload({
		name: payload.name ?? existing.name,
		color: payload.color ?? existing.color,
		description: payload.description ?? existing.description,
	});

	const duplicate = await typeModel.findByName(normalized.name);
	if (duplicate && duplicate.id !== typeId) {
		throw httpError(409, 'Type name already exists');
	}

	return typeModel.update(typeId, normalized);
}

async function deleteType(id) {
	const typeId = Number(id);
	if (Number.isNaN(typeId)) {
		throw httpError(400, 'Type id must be numeric');
	}

	const removed = await typeModel.remove(typeId);
	if (!removed) {
		throw httpError(404, 'Type not found');
	}
}

module.exports = {
	listTypes,
	createType,
	updateType,
	deleteType,
};
