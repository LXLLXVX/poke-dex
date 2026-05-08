const { User } = require('../database/ormModels');

function mapRow(row) {
	if (!row) return null;
	return {
		id: row.id,
		username: row.username,
		passwordHash: row.passwordHash,
		role: row.role,
	};
}

async function findByUsername(username) {
	const row = await User.findOne({ where: { username } });
	return mapRow(row?.get({ plain: true }));
}

module.exports = {
	findByUsername,
};
