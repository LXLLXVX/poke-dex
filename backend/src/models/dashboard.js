const { QueryTypes } = require('sequelize');
const sequelize = require('../database/sequelize');
const { Trainer, Type } = require('../database/ormModels');

function mapSummaryRow(row) {
	return {
		trainerId: row.trainer_id,
		trainerName: row.trainer_name,
		hometown: row.hometown,
		badgeCount: row.badge_count,
		teamSize: row.team_size,
		uniquePokemon: row.unique_pokemon,
		avgBaseExperience: row.avg_base_experience,
	};
}

async function findTeamDistribution({ trainerId = null, minBadgeCount = null, type = null } = {}) {
	const normalizedType = type ? String(type).trim().toLowerCase() : null;
	const sql = `
		SELECT
			t.id AS trainer_id,
			t.name AS trainer_name,
			t.hometown,
			t.badge_count,
			COUNT(tm.id) AS team_size,
			COUNT(DISTINCT p.national_dex) AS unique_pokemon,
			ROUND(AVG(p.base_experience), 1) AS avg_base_experience
		FROM trainers t
		LEFT JOIN pokemon p ON p.trainer_id = t.id
		LEFT JOIN team_members tm ON tm.national_dex = p.national_dex
		WHERE
			(? IS NULL OR t.id = ?)
			AND (? IS NULL OR t.badge_count >= ?)
			AND (? IS NULL OR JSON_CONTAINS(p.types_json, JSON_QUOTE(?), '$'))
		GROUP BY t.id, t.name, t.hometown, t.badge_count
		ORDER BY team_size DESC, t.name ASC
	`;

	const rows = await sequelize.query(sql, {
		replacements: [
		trainerId,
		trainerId,
		minBadgeCount,
		minBadgeCount,
		normalizedType,
		normalizedType,
		],
		type: QueryTypes.SELECT,
	});

	return rows.map(mapSummaryRow);
}

async function findTrainerOptions() {
	const rows = await Trainer.findAll({ attributes: ['id', 'name'], order: [['name', 'ASC']] });
	return rows.map((row) => {
		const plain = row.get({ plain: true });
		return { id: plain.id, name: plain.name };
	});
}

async function findTypeOptions() {
	const rows = await Type.findAll({ attributes: ['id', 'name'], order: [['name', 'ASC']] });
	return rows.map((row) => {
		const plain = row.get({ plain: true });
		return { id: plain.id, name: plain.name };
	});
}

module.exports = {
	findTeamDistribution,
	findTrainerOptions,
	findTypeOptions,
};
