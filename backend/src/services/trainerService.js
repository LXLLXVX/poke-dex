const trainerModel = require('../models/trainer');
const { httpError } = require('../utils/httpError');

function sanitizeString(value) {
	return typeof value === 'string' ? value.trim() : '';
}

function isValidHttpUrl(value) {
	try {
		const parsed = new URL(value);
		return parsed.protocol === 'http:' || parsed.protocol === 'https:';
	} catch {
		return false;
	}
}

function normalizeBadgeCount(value) {
	const parsed = Number(value);
	if (!Number.isInteger(parsed)) {
		throw httpError(400, 'badgeCount must be an integer');
	}
	if (parsed < 0 || parsed > 8) {
		throw httpError(400, 'badgeCount must be between 0 and 8');
	}
	return parsed;
}

function normalizeTrainerPayload(payload) {
	const name = sanitizeString(payload.name);
	if (!name) {
		throw httpError(400, 'Trainer name is required');
	}
	if (name.length < 2 || name.length > 80) {
		throw httpError(400, 'Trainer name must have between 2 and 80 characters');
	}
	if (!/^[a-zA-Z0-9 .'-]+$/.test(name)) {
		throw httpError(400, 'Trainer name contains invalid characters');
	}

	const hometown = sanitizeString(payload.hometown);
	if (hometown.length > 120) {
		throw httpError(400, 'hometown cannot exceed 120 characters');
	}

	const bio = sanitizeString(payload.bio);
	if (bio.length > 2000) {
		throw httpError(400, 'bio cannot exceed 2000 characters');
	}

	const portraitUrl = sanitizeString(payload.portraitUrl);
	if (portraitUrl && !isValidHttpUrl(portraitUrl)) {
		throw httpError(400, 'portraitUrl must be a valid http/https URL');
	}
	if (portraitUrl.length > 255) {
		throw httpError(400, 'portraitUrl cannot exceed 255 characters');
	}

	return {
		name,
		hometown: hometown || null,
		badgeCount: normalizeBadgeCount(payload.badgeCount ?? 0),
		bio: bio || null,
		portraitUrl: portraitUrl || null,
	};
}

async function listTrainers() {
	return trainerModel.findAll();
}

async function createTrainer(payload) {
	const normalized = normalizeTrainerPayload(payload);
	return trainerModel.create(normalized);
}

async function updateTrainer(id, payload) {
	const trainerId = Number(id);
	if (Number.isNaN(trainerId)) {
		throw httpError(400, 'Trainer id must be numeric');
	}

	const existing = await trainerModel.findById(trainerId);
	if (!existing) {
		throw httpError(404, 'Trainer not found');
	}

	const normalized = normalizeTrainerPayload({
		name: payload.name ?? existing.name,
		hometown: payload.hometown ?? existing.hometown,
		badgeCount: payload.badgeCount ?? existing.badgeCount,
		bio: payload.bio ?? existing.bio,
		portraitUrl: payload.portraitUrl ?? existing.portraitUrl,
	});

	return trainerModel.update(trainerId, normalized);
}

async function deleteTrainer(id) {
	const trainerId = Number(id);
	if (Number.isNaN(trainerId)) {
		throw httpError(400, 'Trainer id must be numeric');
	}

	const removed = await trainerModel.remove(trainerId);
	if (!removed) {
		throw httpError(404, 'Trainer not found');
	}
}

module.exports = {
	listTrainers,
	createTrainer,
	updateTrainer,
	deleteTrainer,
};
