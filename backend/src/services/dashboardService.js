const dashboardModel = require('../models/dashboard');
const { httpError } = require('../utils/httpError');

function parseOptionalInt(value, fieldName, { min = 0, max = Number.MAX_SAFE_INTEGER } = {}) {
	if (value === undefined || value === null || value === '') {
		return null;
	}

	const parsed = Number(value);
	if (!Number.isInteger(parsed)) {
		throw httpError(400, `${fieldName} must be an integer`);
	}
	if (parsed < min || parsed > max) {
		throw httpError(400, `${fieldName} must be between ${min} and ${max}`);
	}

	return parsed;
}

function parseOptionalType(value) {
	if (value === undefined || value === null || value === '') {
		return null;
	}

	const normalized = String(value).trim().toLowerCase();
	if (!/^[a-z-]{3,20}$/.test(normalized)) {
		throw httpError(400, 'type filter has invalid format');
	}

	return normalized;
}

async function getTeamDistribution(filters = {}) {
	const trainerId = parseOptionalInt(filters.trainerId, 'trainerId', { min: 1, max: 1000000 });
	const minBadgeCount = parseOptionalInt(filters.minBadgeCount, 'minBadgeCount', { min: 0, max: 8 });
	const type = parseOptionalType(filters.type);

	const [summary, trainerOptions, typeOptions] = await Promise.all([
		dashboardModel.findTeamDistribution({ trainerId, minBadgeCount, type }),
		dashboardModel.findTrainerOptions(),
		dashboardModel.findTypeOptions(),
	]);

	return {
		filters: {
			trainerId,
			minBadgeCount,
			type,
		},
		options: {
			trainers: trainerOptions,
			types: typeOptions,
		},
		summary,
	};
}

module.exports = {
	getTeamDistribution,
};
