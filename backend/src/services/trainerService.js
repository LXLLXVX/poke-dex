const trainerModel = require('../models/trainer');
const { httpError } = require('../utils/httpError');

function sanitizeString(value) {
	return typeof value === 'string' ? value.trim() : '';
}

function normalizeBadgeCount(value) {
	const parsed = Number(value);
	if (Number.isNaN(parsed) || parsed < 0) {
		return 0;
	}
	if (parsed > 8) {
		return 8;
	}
	return parsed;
}

function normalizeTrainerPayload(payload) {
	const name = sanitizeString(payload.name);
	if (!name) {
		throw httpError(400, 'Trainer name is required');
	}

	const hometown = sanitizeString(payload.hometown);
	const bio = sanitizeString(payload.bio);
	const portraitUrl = sanitizeString(payload.portraitUrl);

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
