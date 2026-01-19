const TRAINERS = [
	{
		name: 'Ash Ketchum',
		hometown: 'Pallet Town',
		badge_count: 8,
		bio: 'Traveler aiming to become a Pokémon Master with an ever-rotating roster.',
		portrait_url: '/trainers/ash-ketchum.png',
	},
	{
		name: 'Misty',
		hometown: 'Cerulean City',
		badge_count: 4,
		bio: 'Cerulean gym leader who commands agile Water-type teams.',
		portrait_url: '/trainers/misty.svg',
	},
	{
		name: 'Brock',
		hometown: 'Pewter City',
		badge_count: 6,
		bio: 'Pewter gym leader and tactical mentor focused on Rock-type defense.',
		portrait_url: '/trainers/brock.svg',
	},
	{
		name: 'Lt. Surge',
		hometown: 'Vermilion City',
		badge_count: 5,
		bio: '"Lightning American" who overwhelms challengers with Electric battalions.',
		portrait_url: '/trainers/lt-surge.svg',
	},
	{
		name: 'Erika',
		hometown: 'Celadon City',
		badge_count: 5,
		bio: 'Elegant Grass-type artisan blending aromatherapy with battlefield control.',
		portrait_url: '/trainers/erika.svg',
	},
	{
		name: 'Koga',
		hometown: 'Fuchsia City',
		badge_count: 6,
		bio: 'Ninja-artist who weaponizes Poison tactics and battlefield hazards.',
		portrait_url: '/trainers/koga.svg',
	},
	{
		name: 'Sabrina',
		hometown: 'Saffron City',
		badge_count: 7,
		bio: 'Psychic prodigy whose mind games decide matches before the first move.',
		portrait_url: '/trainers/sabrina.svg',
	},
	{
		name: 'Blaine',
		hometown: 'Cinnabar Island',
		badge_count: 7,
		bio: 'Volcanic scholar with a penchant for explosive Fire-type offense.',
		portrait_url: '/trainers/blaine.png',
	},
	{
		name: 'Giovanni',
		hometown: 'Viridian City',
		badge_count: 8,
		bio: 'Shadowy Viridian leader balancing Ground mastery with Team Rocket resources.',
		portrait_url: '/trainers/giovanni.svg',
	},
	{
		name: 'Lorelei',
		hometown: 'Four Island',
		badge_count: 8,
		bio: 'Elite Four opener who freezes opponents with disciplined Ice squads.',
		portrait_url: '/trainers/lorelei.svg',
	},
	{
		name: 'Bruno',
		hometown: 'Unknown (Kanto Mountains)',
		badge_count: 8,
		bio: 'Elite Four bruiser relying on Fighting power and relentless training.',
		portrait_url: '/trainers/bruno.svg',
	},
	{
		name: 'Agatha',
		hometown: 'Lavender Town',
		badge_count: 8,
		bio: 'Veteran ghost tactician who weaponizes fear and attrition.',
		portrait_url: '/trainers/agatha.png',
	},
	{
		name: 'Lance',
		hometown: 'Blackthorn City',
		badge_count: 8,
		bio: 'Dragon master and Kanto Champion with unstoppable aerial offense.',
		portrait_url: '/trainers/lance.svg',
	},
];

module.exports = {
	seed: async (db) => {
		await db.query('DELETE FROM trainers');

		const insertSql = `
			INSERT INTO trainers (name, hometown, badge_count, bio, portrait_url)
			VALUES (?, ?, ?, ?, ?)
			ON DUPLICATE KEY UPDATE hometown = VALUES(hometown), badge_count = VALUES(badge_count), bio = VALUES(bio), portrait_url = VALUES(portrait_url);
		`;

		for (const trainer of TRAINERS) {
			await db.execute(insertSql, [trainer.name, trainer.hometown, trainer.badge_count, trainer.bio, trainer.portrait_url]);
		}
	},
};
