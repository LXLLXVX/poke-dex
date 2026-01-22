import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';

const DEFAULT_FORM = {
	nationalDex: '',
	nickname: '',
	role: '',
	notes: '',
};

function TeamMemberForm({
	pokemonOptions,
	onSubmit,
	onCancel,
	isEditing,
	initialValues,
	disabled,
	remainingSlots,
}) {
	const [formState, setFormState] = useState(DEFAULT_FORM);
	const [localError, setLocalError] = useState(null);

	useEffect(() => {
		if (initialValues) {
			setFormState({
				nationalDex: String(initialValues.nationalDex ?? ''),
				nickname: initialValues.nickname ?? '',
				role: initialValues.role ?? '',
				notes: initialValues.notes ?? '',
			});
		} else {
			setFormState(DEFAULT_FORM);
		}
		setLocalError(null);
	}, [initialValues]);

	const sortedOptions = useMemo(
		() =>
			[...pokemonOptions].sort((a, b) => a.nationalDex - b.nationalDex),
		[pokemonOptions]
	);

	const handleChange = (event) => {
		const { name, value } = event.target;
		setFormState((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = (event) => {
		event.preventDefault();
		setLocalError(null);

		if (!formState.nationalDex) {
			setLocalError('Select a Pokemon for this slot.');
			return;
		}

		onSubmit({
			nationalDex: Number(formState.nationalDex),
			nickname: formState.nickname.trim() || null,
			role: formState.role.trim() || null,
			notes: formState.notes.trim() || null,
		});
	};

	const handleReset = () => {
		setFormState(DEFAULT_FORM);
		setLocalError(null);
		onCancel?.();
	};

	return (
		<form className="team-form" onSubmit={handleSubmit}>
			<header>
				<p className="eyebrow">{isEditing ? 'Edit slot' : 'New slot'}</p>
				<h3>{isEditing ? 'Adjust team details' : 'Load your ideal strategy'}</h3>
				<p className="muted">{remainingSlots} open slots</p>
			</header>

			<label>
				<span>Pokemon</span>
				<select
					name="nationalDex"
					value={formState.nationalDex}
					onChange={handleChange}
					disabled={disabled}
				>
					<option value="">Choose a member</option>
					{sortedOptions.map((pokemon) => (
						<option key={pokemon.nationalDex} value={pokemon.nationalDex}>
							#{String(pokemon.nationalDex).padStart(3, '0')} — {pokemon.name}
						</option>
					))}
				</select>
			</label>

			<label>
				<span>Nickname</span>
				<input name="nickname" value={formState.nickname} onChange={handleChange} placeholder="Optional" maxLength={80} disabled={disabled} />
			</label>

			<label>
				<span>Battle role</span>
				<input name="role" value={formState.role} onChange={handleChange} placeholder="Lead, Sweeper, Support..." maxLength={60} disabled={disabled} />
			</label>

			<label>
				<span>Tactical notes</span>
				<textarea
					name="notes"
					value={formState.notes}
					onChange={handleChange}
					rows={4}
					placeholder="Coverage, synergies, items, etc."
					maxLength={255}
					disabled={disabled}
				/>
			</label>

			{localError && <p className="inline-error">{localError}</p>}

			<div className="form-actions">
				<button type="submit" className="ghost" disabled={disabled}>
					{isEditing ? 'Update slot' : 'Add to team'}
				</button>
				<button type="button" className="ghost ghost--muted" onClick={handleReset} disabled={disabled}>
					Cancel
				</button>
			</div>
		</form>
	);
}

TeamMemberForm.propTypes = {
	pokemonOptions: PropTypes.arrayOf(
		PropTypes.shape({
			nationalDex: PropTypes.number.isRequired,
			name: PropTypes.string.isRequired,
		})
	).isRequired,
	onSubmit: PropTypes.func.isRequired,
	onCancel: PropTypes.func,
	isEditing: PropTypes.bool,
	initialValues: PropTypes.shape({
		nationalDex: PropTypes.number,
		nickname: PropTypes.string,
		role: PropTypes.string,
		notes: PropTypes.string,
	}),
	disabled: PropTypes.bool,
	remainingSlots: PropTypes.number.isRequired,
};

TeamMemberForm.defaultProps = {
	onCancel: undefined,
	isEditing: false,
	initialValues: null,
	disabled: false,
};

export default TeamMemberForm;
