const TYPES = [
	{ name: 'normal', color: '#A8A77A', description: 'Balanced type with few inherent strengths.' },
	{ name: 'fire', color: '#EE8130', description: 'Specializes in offensive, high-heat moves.' },
	{ name: 'water', color: '#6390F0', description: 'Adaptable type that excels at control.' },
	{ name: 'electric', color: '#F7D02C', description: 'Fast attackers focused on paralysis and burst damage.' },
	{ name: 'grass', color: '#7AC74C', description: 'Utility-focused type with sustain and control.' },
	{ name: 'ice', color: '#96D9D6', description: 'Glass-cannon style with powerful crowd control.' },
	{ name: 'fighting', color: '#C22E28', description: 'Close-quarters experts that punch through defenses.' },
	{ name: 'poison', color: '#A33EA1', description: 'Status-inflicting specialists that wear foes down.' },
	{ name: 'ground', color: '#E2BF65', description: 'Earth-shaping power that counters Electric types.' },
	{ name: 'flying', color: '#A98FF3', description: 'High mobility units that dodge ground attacks.' },
	{ name: 'psychic', color: '#F95587', description: 'Mind-based fighters with high special attack.' },
	{ name: 'bug', color: '#A6B91A', description: 'Swarm tactics and utility moves define this type.' },
	{ name: 'rock', color: '#B6A136', description: 'Defensive titans with strong physical presence.' },
	{ name: 'ghost', color: '#735797', description: 'Intangible tricksters that ignore normal defenses.' },
	{ name: 'dragon', color: '#6F35FC', description: 'Late-game powerhouses with high stats across the board.' },
	{ name: 'dark', color: '#705746', description: 'Exploit enemy weaknesses with sneaky tactics.' },
	{ name: 'steel', color: '#B7B7CE', description: 'Extremely durable type with many resistances.' },
	{ name: 'fairy', color: '#D685AD', description: 'Protective type that counters dragons.' },
];

module.exports = {
	seed: async (db) => {
		const insertSql = `
			INSERT INTO types (name, color, description)
			VALUES (?, ?, ?)
			ON DUPLICATE KEY UPDATE color = VALUES(color), description = VALUES(description);
		`;

		for (const type of TYPES) {
			await db.execute(insertSql, [type.name, type.color, type.description]);
		}
	},
};
