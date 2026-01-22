import PropTypes from 'prop-types';

const MAX_TEAM_SIZE = 6;

function formatDexNumber(nationalDex) {
	return String(nationalDex).padStart(3, '0');
}

function TypeChips({ types }) {
	if (!types?.length) {
		return <span className="muted">No types logged</span>;
	}

	return (
		<div className="team-card__types">
			{types.map((type) => (
				<span key={type} className={`type-pill type-${type}`}>
					{type}
				</span>
			))}
		</div>
	);
}

TypeChips.propTypes = {
	types: PropTypes.arrayOf(PropTypes.string),
};

const teamMemberShape = PropTypes.shape({
	id: PropTypes.number.isRequired,
	nationalDex: PropTypes.number.isRequired,
	nickname: PropTypes.string,
	role: PropTypes.string,
	notes: PropTypes.string,
	pokemon: PropTypes.shape({
		name: PropTypes.string,
		spriteUrl: PropTypes.string,
		types: PropTypes.arrayOf(PropTypes.string),
	}),
});

function TeamMemberCard({ member, onEdit, onRemove }) {
	const pokemonName = member.pokemon?.name ?? 'Unknown';
	const spriteUrl = member.pokemon?.spriteUrl ?? '/pokeball.svg';
	const types = member.pokemon?.types ?? [];

	return (
		<article className="team-card" aria-label={`${pokemonName} slot`}>
			<header>
				<div>
					<p className="eyebrow">#{formatDexNumber(member.nationalDex)}</p>
					<h3>{pokemonName}</h3>
				</div>
				<img src={spriteUrl} alt={pokemonName} width="80" height="80" loading="lazy" />
			</header>
			<TypeChips types={types} />
			<div className="team-card__meta">
				<div>
					<span>Nickname</span>
					<strong>{member.nickname ?? '—'}</strong>
				</div>
				<div>
					<span>Role</span>
					<strong>{member.role ?? '—'}</strong>
				</div>
			</div>
			{member.notes && <p className="team-card__notes">{member.notes}</p>}
			<footer>
				<button type="button" className="ghost" onClick={() => onEdit(member)}>
					Edit slot
				</button>
				<button type="button" className="ghost ghost--danger" onClick={() => onRemove(member)}>
					Release
				</button>
			</footer>
		</article>
	);
}


TeamMemberCard.propTypes = {
	member: teamMemberShape.isRequired,
	onEdit: PropTypes.func.isRequired,
	onRemove: PropTypes.func.isRequired,
};

function EmptySlot({ index }) {
	return (
		<div className="team-card team-card--empty" aria-label={`Empty slot ${index}`}>
			<p className="eyebrow">Slot {index}</p>
			<h3>Vacant</h3>
			<p>Load a new Pokémon to draft into this roster slot.</p>
		</div>
	);
}

EmptySlot.propTypes = {
	index: PropTypes.number.isRequired,
};

function TeamRoster({ team, onEdit, onRemove }) {
	const slots = Array.from({ length: MAX_TEAM_SIZE }, (_, idx) => team[idx] ?? null);

	return (
		<div className="team-roster">
			{slots.map((member, index) =>
				member ? (
					<TeamMemberCard key={member.id} member={member} onEdit={onEdit} onRemove={onRemove} />
				) : (
					<EmptySlot key={`empty-${index + 1}`} index={index + 1} />
				)
			)}
		</div>
	);
}

TeamRoster.propTypes = {
	team: PropTypes.arrayOf(teamMemberShape).isRequired,
	onEdit: PropTypes.func.isRequired,
	onRemove: PropTypes.func.isRequired,
};

export default TeamRoster;
