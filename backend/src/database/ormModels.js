const { DataTypes } = require('sequelize');
const sequelize = require('./sequelize');

const Type = sequelize.define(
	'Type',
	{
		id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
		name: { type: DataTypes.STRING(40), allowNull: false, unique: true },
		color: { type: DataTypes.STRING(20), allowNull: true },
		description: { type: DataTypes.TEXT, allowNull: true },
	},
	{ tableName: 'types', underscored: true, timestamps: true }
);

const Trainer = sequelize.define(
	'Trainer',
	{
		id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
		name: { type: DataTypes.STRING(80), allowNull: false, unique: true },
		hometown: { type: DataTypes.STRING(120), allowNull: true },
		badgeCount: { type: DataTypes.TINYINT.UNSIGNED, allowNull: true, field: 'badge_count' },
		bio: { type: DataTypes.TEXT, allowNull: true },
		portraitUrl: { type: DataTypes.STRING(255), allowNull: true, field: 'portrait_url' },
	},
	{ tableName: 'trainers', underscored: true, timestamps: true }
);

const Pokemon = sequelize.define(
	'Pokemon',
	{
		id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
		nationalDex: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, unique: true, field: 'national_dex' },
		name: { type: DataTypes.STRING(80), allowNull: false },
		height: { type: DataTypes.SMALLINT.UNSIGNED, allowNull: true },
		weight: { type: DataTypes.SMALLINT.UNSIGNED, allowNull: true },
		baseExperience: { type: DataTypes.SMALLINT.UNSIGNED, allowNull: true, field: 'base_experience' },
		spriteUrl: { type: DataTypes.STRING(255), allowNull: true, field: 'sprite_url' },
		typesJson: { type: DataTypes.JSON, allowNull: false, field: 'types_json' },
		abilitiesJson: { type: DataTypes.JSON, allowNull: false, field: 'abilities_json' },
		statsJson: { type: DataTypes.JSON, allowNull: false, field: 'stats_json' },
		trainerId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true, field: 'trainer_id' },
	},
	{ tableName: 'pokemon', underscored: true, timestamps: true }
);

const TeamMember = sequelize.define(
	'TeamMember',
	{
		id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
		nationalDex: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'national_dex' },
		nickname: { type: DataTypes.STRING(80), allowNull: true },
		role: { type: DataTypes.STRING(60), allowNull: true },
		notes: { type: DataTypes.STRING(255), allowNull: true },
	},
	{ tableName: 'team_members', underscored: true, timestamps: true }
);

const User = sequelize.define(
	'User',
	{
		id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
		username: { type: DataTypes.STRING(80), allowNull: false, unique: true },
		passwordHash: { type: DataTypes.STRING(255), allowNull: false, field: 'password_hash' },
		role: { type: DataTypes.ENUM('admin', 'trainer'), allowNull: false },
	},
	{ tableName: 'users', underscored: true, timestamps: true }
);

Trainer.hasMany(Pokemon, { as: 'pokemonRoster', foreignKey: 'trainerId', sourceKey: 'id' });
Pokemon.belongsTo(Trainer, { as: 'trainer', foreignKey: 'trainerId', targetKey: 'id' });
Pokemon.hasMany(TeamMember, { as: 'teamMembers', foreignKey: 'nationalDex', sourceKey: 'nationalDex' });
TeamMember.belongsTo(Pokemon, { as: 'pokemon', foreignKey: 'nationalDex', targetKey: 'nationalDex' });

module.exports = {
	sequelize,
	Type,
	Trainer,
	Pokemon,
	TeamMember,
	User,
};
