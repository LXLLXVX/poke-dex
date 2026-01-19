const typeModel = require('../models/type');
const { httpError } = require('../utils/httpError');

function sanitizeString(value) {
	return typeof value === 'string' ? value.trim() : '';
}

function normalizeTypePayload(payload) {
	const name = sanitizeString(payload.name);
	if (!name) {
		throw httpError(400, 'Type name is required');
	}

	const color = sanitizeString(payload.color);
	const description = sanitizeString(payload.description);

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
