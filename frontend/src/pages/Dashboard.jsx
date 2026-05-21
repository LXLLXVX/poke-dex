import { useEffect, useMemo, useState } from 'react';
import LiveActivityFeed from '../components/realtime/LiveActivityFeed';
import { buildAuthHeaders } from '../utils/authToken';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api';

function Dashboard() {
	const [rows, setRows] = useState([]);
	const [trainerOptions, setTrainerOptions] = useState([]);
	const [typeOptions, setTypeOptions] = useState([]);
	const [status, setStatus] = useState('idle');
	const [error, setError] = useState(null);
	const [filters, setFilters] = useState({
		trainerId: '',
		minBadgeCount: '0',
		type: '',
	});

	useEffect(() => {
		const controller = new AbortController();
		setStatus('loading');
		setError(null);

		const params = new URLSearchParams();
		if (filters.trainerId) params.set('trainerId', filters.trainerId);
		if (filters.minBadgeCount !== '') params.set('minBadgeCount', filters.minBadgeCount);
		if (filters.type) params.set('type', filters.type);

		async function loadData() {
			try {
				const response = await fetch(`${API_BASE_URL}/dashboard/team-distribution?${params.toString()}`, {
					signal: controller.signal,
					headers: buildAuthHeaders(),
				});
				if (!response.ok) {
					const payload = await response.json().catch(() => ({}));
					throw new Error(payload.message ?? 'No fue posible cargar el dashboard.');
				}

				const payload = await response.json();
				const data = payload.data ?? {};
				setRows(Array.isArray(data.summary) ? data.summary : []);
				setTrainerOptions(Array.isArray(data.options?.trainers) ? data.options.trainers : []);
				setTypeOptions(Array.isArray(data.options?.types) ? data.options.types : []);
				setStatus('ready');
			} catch (requestError) {
				if (requestError.name === 'AbortError') return;
				setError(requestError.message ?? 'Error inesperado en dashboard.');
				setStatus('error');
			}
		}

		loadData();
		return () => controller.abort();
	}, [filters]);

	const maxTeamSize = useMemo(() => {
		if (!rows.length) return 1;
		return Math.max(...rows.map((entry) => Number(entry.teamSize) || 0), 1);
	}, [rows]);

	const totals = useMemo(() => {
		const trainers = rows.length;
		const teamSlots = rows.reduce((sum, row) => sum + (Number(row.teamSize) || 0), 0);
		const uniquePokemon = rows.reduce((sum, row) => sum + (Number(row.uniquePokemon) || 0), 0);
		return { trainers, teamSlots, uniquePokemon };
	}, [rows]);

	return (
		<section className="dashboard-page">
			<header className="dashboard-hero">
				<div>
					<p className="eyebrow">Analytics dashboard</p>
					<h2>Distribucion de equipo por entrenador</h2>
					<p className="subtitle">
						Consulta de 3 tablas: trainers + pokemon + team_members. Usa filtros y revisa la grafica por entrenador.
					</p>
				</div>
				<div className="dashboard-hero__stats">
					<div>
						<span>Entrenadores</span>
						<strong>{totals.trainers}</strong>
					</div>
					<div>
						<span>Slots en equipos</span>
						<strong>{totals.teamSlots}</strong>
					</div>
					<div>
						<span>Pokemon unicos</span>
						<strong>{totals.uniquePokemon}</strong>
					</div>
				</div>
			</header>

			<div className="dashboard-filters">
				<label htmlFor="dash-trainer">
					Entrenador
					<select
						id="dash-trainer"
						value={filters.trainerId}
						onChange={(event) => setFilters((prev) => ({ ...prev, trainerId: event.target.value }))}
					>
						<option value="">Todos</option>
						{trainerOptions.map((trainer) => (
							<option key={trainer.id} value={trainer.id}>
								{trainer.name}
							</option>
						))}
					</select>
				</label>

				<label htmlFor="dash-badges">
					Min badges
					<input
						id="dash-badges"
						type="number"
						min="0"
						max="8"
						value={filters.minBadgeCount}
						onChange={(event) => setFilters((prev) => ({ ...prev, minBadgeCount: event.target.value }))}
					/>
				</label>

				<label htmlFor="dash-type">
					Tipo
					<select
						id="dash-type"
						value={filters.type}
						onChange={(event) => setFilters((prev) => ({ ...prev, type: event.target.value }))}
					>
						<option value="">Todos</option>
						{typeOptions.map((type) => (
							<option key={type.id} value={type.name}>
								{type.name}
							</option>
						))}
					</select>
				</label>
			</div>

			<LiveActivityFeed />

			{status === 'loading' && <p className="muted">Cargando dashboard...</p>}
			{status === 'error' && <p className="error">{error}</p>}

			{status === 'ready' && (
				<div className="dashboard-chart">
					{rows.length === 0 && <p className="muted">No hay datos para los filtros seleccionados.</p>}
					{rows.map((row) => {
						const size = Number(row.teamSize) || 0;
						const percentage = Math.max(4, Math.round((size / maxTeamSize) * 100));
						return (
							<article key={row.trainerId} className="chart-bar-card">
								<header>
									<h3>{row.trainerName}</h3>
									<span>{row.badgeCount} badges</span>
								</header>
								<div className="chart-bar-track" role="img" aria-label={`Team size de ${row.trainerName}: ${size}`}>
									<div className="chart-bar-fill" style={{ width: `${percentage}%` }} />
								</div>
								<footer>
									<span>Team size: {size}</span>
									<span>Avg EXP: {row.avgBaseExperience ?? 'N/A'}</span>
								</footer>
							</article>
						);
					})}
				</div>
			)}
		</section>
	);
}

export default Dashboard;
