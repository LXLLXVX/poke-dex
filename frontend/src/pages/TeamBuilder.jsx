import { useEffect, useMemo, useState } from 'react';
import TeamRoster from '../components/team/TeamRoster';
import TeamMemberForm from '../components/team/TeamMemberForm';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api';
const MAX_TEAM_SIZE = 6;

function TeamBuilder() {
	const [team, setTeam] = useState([]);
	const [pokemonCatalog, setPokemonCatalog] = useState([]);
	const [status, setStatus] = useState('idle');
	const [error, setError] = useState(null);
	const [formStatus, setFormStatus] = useState('idle');
	const [editingMember, setEditingMember] = useState(null);
	const [feedback, setFeedback] = useState(null);

	useEffect(() => {
		async function bootstrap() {
			setStatus('loading');
			setError(null);
			try {
				const [teamRes, catalogRes] = await Promise.all([
					fetch(`${API_BASE_URL}/team`),
					fetch(`${API_BASE_URL}/pokemon?limit=151`),
				]);

				if (!teamRes.ok) {
					const payload = await teamRes.json().catch(() => ({}));
					throw new Error(payload.message ?? 'Unable to load your team');
				}
				if (!catalogRes.ok) {
					const payload = await catalogRes.json().catch(() => ({}));
					throw new Error(payload.message ?? 'Unable to load the base Pokedex');
				}

				const teamPayload = await teamRes.json();
				const catalogPayload = await catalogRes.json();
				setTeam(Array.isArray(teamPayload.data) ? teamPayload.data : []);
				setPokemonCatalog(Array.isArray(catalogPayload.data) ? catalogPayload.data : []);
				setStatus('ready');
			} catch (err) {
				setError(err.message ?? 'An unexpected error occurred');
				setStatus('error');
			}
		}

		bootstrap();
	}, []);

	const remainingSlots = Math.max(0, MAX_TEAM_SIZE - team.length);
	const isTeamAtCapacity = team.length >= MAX_TEAM_SIZE;
	const isFormDisabled = formStatus === 'submitting' || (isTeamAtCapacity && !editingMember);

	const stats = useMemo(() => {
		const typeSet = new Set();
		let dualTypeCount = 0;
		team.forEach((member) => {
			const types = member.pokemon?.types ?? [];
			types.forEach((type) => typeSet.add(type));
			if (types.length >= 2) {
				dualTypeCount += 1;
			}
		});

		return {
			uniqueTypes: typeSet.size,
			dualTypeCount,
			completion: Math.round((team.length / MAX_TEAM_SIZE) * 100),
		};
	}, [team]);

	async function refreshTeam() {
		const response = await fetch(`${API_BASE_URL}/team`);
		if (!response.ok) {
			const payload = await response.json().catch(() => ({}));
			throw new Error(payload.message ?? 'Unable to refresh the roster');
		}
		const payload = await response.json();
		setTeam(Array.isArray(payload.data) ? payload.data : []);
	}

	const handleSubmit = async (formValues) => {
		setFormStatus('submitting');
		setFeedback(null);
		try {
			const endpoint = editingMember ? `${API_BASE_URL}/team/${editingMember.id}` : `${API_BASE_URL}/team`;
			const method = editingMember ? 'PUT' : 'POST';
			const response = await fetch(endpoint, {
				method,
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(formValues),
			});

			if (!response.ok) {
				const payload = await response.json().catch(() => ({}));
				throw new Error(payload.message ?? 'Unable to save the slot');
			}

			await refreshTeam();
			setEditingMember(null);
			setFeedback(editingMember ? 'Slot updated' : 'New member added');
		} catch (err) {
			setFeedback(err.message ?? 'Oops, something went wrong');
		} finally {
			setFormStatus('idle');
		}
	};

	const handleEdit = (member) => {
		setEditingMember(member);
	};

	const handleCancel = () => {
		setEditingMember(null);
	};

	const handleRemove = async (member) => {
		const shouldRemove = window.confirm(
			`Are you sure you want to release ${member.pokemon?.name ?? 'this Pokemon'} from the team?`
		);
		if (!shouldRemove) return;

		try {
			const response = await fetch(`${API_BASE_URL}/team/${member.id}`, { method: 'DELETE' });
			if (!response.ok) {
				const payload = await response.json().catch(() => ({}));
				throw new Error(payload.message ?? 'Unable to clear the slot');
			}
			if (editingMember?.id === member.id) {
				setEditingMember(null);
			}
			await refreshTeam();
			setFeedback('Slot cleared');
		} catch (err) {
			setFeedback(err.message ?? 'Unable to delete the slot');
		}
	};

	if (status === 'loading') {
		return (
			<section className="placeholder-panel">
				<h2>Team Builder</h2>
				<p>Syncing your strategy lab...</p>
			</section>
		);
	}

	if (status === 'error') {
		return (
			<section className="placeholder-panel">
				<h2>Team Builder</h2>
				<p className="error">{error}</p>
			</section>
		);
	}

	const formKey = editingMember ? `edit-${editingMember.id}` : `new-${team.length}`;

	return (
		<section className="team-builder">
			<header className="team-hero">
				<div>
					<p className="eyebrow">Kanto tactics lab</p>
					<h2>Design the perfect squad.</h2>
					<p className="subtitle">
						Draft any Generation I Pokemon, assign roles, and capture the key synergy for your upcoming battles.
					</p>
				</div>
				<div className="team-hero__stats">
					<div>
						<span>Slots used</span>
						<strong>
							{team.length}/{MAX_TEAM_SIZE}
						</strong>
					</div>
					<div>
						<span>Unique types</span>
						<strong>{stats.uniqueTypes}</strong>
					</div>
					<div>
						<span>Dual-type</span>
						<strong>{stats.dualTypeCount}</strong>
					</div>
					<div>
						<span>Progress</span>
						<strong>{stats.completion}%</strong>
					</div>
				</div>
			</header>

			<div className="team-layout">
				<div>
					<TeamRoster team={team} onEdit={handleEdit} onRemove={handleRemove} />
				</div>
				<aside className="team-sidebar">
					<TeamMemberForm
						key={formKey}
						pokemonOptions={pokemonCatalog}
						onSubmit={handleSubmit}
						onCancel={handleCancel}
						isEditing={Boolean(editingMember)}
						initialValues={editingMember}
						disabled={isFormDisabled}
						remainingSlots={remainingSlots}
					/>
					{isTeamAtCapacity && !editingMember && <p className="muted form-feedback">Roster is full. Edit or clear a slot to add another Pokemon.</p>}
					{feedback && <p className="muted form-feedback">{feedback}</p>}
				</aside>
			</div>
		</section>
	);
}

export default TeamBuilder;
