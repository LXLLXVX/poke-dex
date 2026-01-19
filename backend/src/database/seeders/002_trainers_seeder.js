const TRAINERS = [
	{
		name: 'Ash Ketchum',
		hometown: 'Pallet Town',
		badge_count: 8,
		bio: 'Aspiring Pokémon Master traveling through Kanto.',
	},
	{
		name: 'Misty',
		hometown: 'Cerulean City',
		badge_count: 4,
		bio: 'Water-type gym leader known for strategic battles.',
	},
	{
		name: 'Brock',
		hometown: 'Pewter City',
		badge_count: 6,
		bio: 'Rock-type specialist and mentor figure.',
	},
];

module.exports = {
	seed: async (db) => {
		const insertSql = `
			INSERT INTO trainers (name, hometown, badge_count, bio)
			VALUES (?, ?, ?, ?)
			ON DUPLICATE KEY UPDATE hometown = VALUES(hometown), badge_count = VALUES(badge_count), bio = VALUES(bio);
		`;

		for (const trainer of TRAINERS) {
			await db.execute(insertSql, [trainer.name, trainer.hometown, trainer.badge_count, trainer.bio]);
		}
	},
};
