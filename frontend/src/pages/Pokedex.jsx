import { useEffect, useMemo, useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api';
const FALLBACK_TYPES = [
	{ id: 'normal', name: 'normal' },
	{ id: 'fire', name: 'fire' },
	{ id: 'water', name: 'water' },
	{ id: 'electric', name: 'electric' },
	{ id: 'grass', name: 'grass' },
	{ id: 'ice', name: 'ice' },
	{ id: 'fighting', name: 'fighting' },
	{ id: 'poison', name: 'poison' },
	{ id: 'ground', name: 'ground' },
	{ id: 'flying', name: 'flying' },
	{ id: 'psychic', name: 'psychic' },
	{ id: 'bug', name: 'bug' },
	{ id: 'rock', name: 'rock' },
	{ id: 'ghost', name: 'ghost' },
	{ id: 'dragon', name: 'dragon' },
	{ id: 'dark', name: 'dark' },
	{ id: 'steel', name: 'steel' },
	{ id: 'fairy', name: 'fairy' },
];

function useDebouncedValue(value, delay = 250) {
	const [debouncedValue, setDebouncedValue] = useState(value);

	useEffect(() => {
		const handler = setTimeout(() => setDebouncedValue(value), delay);
		return () => clearTimeout(handler);
	}, [value, delay]);

	return debouncedValue;
}

function PokemonCard({ pokemon, onSelect }) {
	return (
		<article
			className="pokemon-card"
			key={pokemon.nationalDex}
			onClick={() => onSelect?.(pokemon.nationalDex)}
			onKeyDown={(event) => {
				if (event.key === 'Enter' || event.key === ' ') {
					event.preventDefault();
					onSelect?.(pokemon.nationalDex);
				}
			}}
			tabIndex={0}
			role="button"
			aria-pressed="false"
		>
			<div className="pokemon-card__badge">#{String(pokemon.nationalDex).padStart(3, '0')}</div>
			<img
				src={pokemon.spriteUrl ?? '/pokeball.svg'}
				alt={pokemon.name}
				className="pokemon-card__sprite"
				loading="lazy"
				width="96"
				height="96"
			/>
			<h3 className="pokemon-card__name">{pokemon.name}</h3>
			<div className="pokemon-card__types">
				{pokemon.types.map((type) => (
					<span key={type} className={`type-pill type-${type}`}>
						{type}
					</span>
				))}
			</div>
			<p className="pokemon-card__hint">Click para ver ficha completa</p>
		</article>
	);
}

function PokemonDetailPanel({ pokemon, status, error, onClose }) {
	const abilityPool = Array.isArray(pokemon?.abilities) ? pokemon.abilities : [];
	const statsPool = Array.isArray(pokemon?.stats) ? pokemon.stats : [];
	const baseAbilities = abilityPool.filter((ability) => !ability.isHidden);
	const hiddenAbilities = abilityPool.filter((ability) => ability.isHidden);
	return (
		<aside className="pokemon-detail">
			<div className="pokemon-detail__header">
				<h3>{pokemon?.name ?? 'Pokémon profile'}</h3>
				<button type="button" className="ghost" onClick={onClose}>
					Close
				</button>
			</div>
			{status === 'idle' && <p>Select a Pokémon card to inspect its dossier.</p>}
			{status === 'loading' && <p>Loading full profile...</p>}
			{status === 'error' && <p className="error">{error ?? 'Unable to load Pokémon profile.'}</p>}
			{status === 'success' && pokemon && (
				<div className="pokemon-detail__body">
					<div className="pokemon-detail__identity">
						<img
							src={pokemon.spriteUrl ?? '/pokeball.svg'}
							alt={pokemon.name}
							width="160"
							height="160"
						/>
						<div>
							<p className="eyebrow">#{String(pokemon.nationalDex).padStart(3, '0')}</p>
							<h4>{pokemon.name}</h4>
							<div className="pokemon-card__types">
								{pokemon.types.map((type) => (
									<span key={type} className={`type-pill type-${type}`}>
										{type}
									</span>
								))}
							</div>
						</div>
					</div>
					<div className="pokemon-detail__metrics">
						<div>
							<span>Height</span>
							<strong>{pokemon.height ?? 'N/A'}</strong>
						</div>
						<div>
							<span>Weight</span>
							<strong>{pokemon.weight ?? 'N/A'}</strong>
						</div>
						<div>
							<span>Base EXP</span>
							<strong>{pokemon.baseExperience ?? 'N/A'}</strong>
						</div>
						<div>
							<span>Trainer</span>
							<strong>{pokemon.trainerId ?? 'Free agent'}</strong>
						</div>
					</div>
					<div className="pokemon-detail__sections">
						<section>
							<h5>Base abilities</h5>
							{baseAbilities.length ? (
								<ul>
									{baseAbilities.map((ability) => (
										<li key={ability.name}>{ability.name}</li>
									))}
								</ul>
							) : (
								<p className="muted">No base abilities registered.</p>
							)}
						</section>
						<section>
							<h5>Hidden abilities</h5>
							{hiddenAbilities.length ? (
								<ul>
									{hiddenAbilities.map((ability) => (
										<li key={ability.name}>{ability.name}</li>
									))}
								</ul>
							) : (
								<p className="muted">No hidden abilities.</p>
							)}
						</section>
						<section className="stats-panel">
							<h5>Base stats</h5>
							{statsPool.length ? (
								<ul>
									{statsPool.map((stat) => (
										<li key={stat.name}>
											<span>{stat.name}</span>
											<div className="stat-meter">
												<div style={{ width: `${Math.min(stat.base, 200)}px` }} />
											</div>
											<strong>{stat.base}</strong>
										</li>
									))}
								</ul>
							) : (
								<p className="muted">No stat data available.</p>
							)}
						</section>
					</div>
				</div>
			)}
		</aside>
	);
}

function EmptyState({ message }) {
	return (
		<div className="empty-state">
			<p>{message}</p>
		</div>
	);
}

function Pokedex() {
	const [pokemon, setPokemon] = useState([]);
	const [types, setTypes] = useState(FALLBACK_TYPES);
	const [searchTerm, setSearchTerm] = useState('');
	const [selectedTypes, setSelectedTypes] = useState([]);
	const [status, setStatus] = useState('idle');
	const [error, setError] = useState(null);
	const [selectedDex, setSelectedDex] = useState(null);
	const [detail, setDetail] = useState(null);
	const [detailStatus, setDetailStatus] = useState('idle');
	const [detailError, setDetailError] = useState(null);

	const debouncedSearch = useDebouncedValue(searchTerm, 300);

	const handleTypeChange = (event) => {
		const values = Array.from(event.target.selectedOptions)
			.map((option) => option.value)
			.filter(Boolean);
		setSelectedTypes(values);
	};

	useEffect(() => {
		let isMounted = true;
		const controller = new AbortController();

		async function loadTypes() {
			try {
				const response = await fetch(`${API_BASE_URL}/types`, { signal: controller.signal });
				if (!response.ok) throw new Error('Unable to load types');
				const payload = await response.json();
				if (isMounted) {
					if (Array.isArray(payload.data) && payload.data.length) {
						setTypes(payload.data);
					}
				}
			} catch (err) {
				if (err.name !== 'AbortError') {
					console.error(err);
				}
			}
		}

		loadTypes();
		return () => {
			isMounted = false;
			controller.abort();
		};
	}, []);

	useEffect(() => {
		const controller = new AbortController();
		setStatus('loading');
		setError(null);

		const params = new URLSearchParams();
		if (debouncedSearch.trim()) params.set('search', debouncedSearch.trim());
		if (selectedTypes.length) {
			selectedTypes.forEach((type) => params.append('types', type));
		}

		async function loadPokemon() {
			try {
				const response = await fetch(`${API_BASE_URL}/pokemon?${params.toString()}`, {
					signal: controller.signal,
				});
				if (!response.ok) throw new Error('Unable to load Pokemon data');
				const payload = await response.json();
				setPokemon(payload.data ?? []);
				setStatus('success');
			} catch (err) {
				if (err.name === 'AbortError') return;
				setError(err.message);
				setStatus('error');
			}
		}

		loadPokemon();
		return () => controller.abort();
	}, [debouncedSearch, selectedTypes]);

	const summary = useMemo(() => {
		const total = pokemon.length;
		const uniqueTypes = new Set(pokemon.flatMap((entry) => entry.types));
		return { total, uniqueTypes: uniqueTypes.size };
	}, [pokemon]);

	useEffect(() => {
		if (!selectedDex) {
			setDetail(null);
			setDetailStatus('idle');
			setDetailError(null);
			return;
		}

		const controller = new AbortController();
		setDetailStatus('loading');
		setDetailError(null);

		async function loadDetail() {
			try {
				const response = await fetch(`${API_BASE_URL}/pokemon/${selectedDex}`, { signal: controller.signal });
				if (!response.ok) throw new Error('Unable to load Pokémon profile');
				const payload = await response.json();
				setDetail(payload.data ?? null);
				setDetailStatus('success');
			} catch (err) {
				if (err.name === 'AbortError') return;
				setDetailError(err.message);
				setDetailStatus('error');
			}
		}

		loadDetail();
		return () => controller.abort();
	}, [selectedDex]);

	return (
		<section className="pokedex">
			<header className="pokedex-hero">
				<div>
					<p className="eyebrow">Live dataset · Generation I</p>
					<h2>Build competitive rosters with verified Kanto intel.</h2>
					<p className="subtitle">
						Search, filter, and scout the original 151 Pokemon directly from your local knowledge base.
					</p>
				</div>
				<div className="hero-stats">
					<div>
						<span>Total ready</span>
						<strong>{summary.total}</strong>
					</div>
					<div>
						<span>Type coverage</span>
						<strong>{summary.uniqueTypes}</strong>
					</div>
				</div>
			</header>

			<div className="filter-panel">
				<div className="search-field">
					<label htmlFor="search">Search Pokemon</label>
					<input
						id="search"
						type="search"
						placeholder="Name, dex number, or tactic"
						value={searchTerm}
						onChange={(event) => setSearchTerm(event.target.value)}
					/>
				</div>
				<div className="select-field">
					<label htmlFor="type">Filter by type</label>
					<select
						id="type"
						multiple
						size={3}
						value={selectedTypes}
						onChange={handleTypeChange}
						className="select-multi compact"
					>
						{types.map((type) => (
							<option key={type.id} value={type.name}>
								{type.name}
							</option>
						))}
					</select>
					<p className="filter-hint">Mantén Ctrl/Cmd para elegir varios tipos.</p>
				</div>
				<button
					type="button"
					className="ghost"
					onClick={() => {
						setSearchTerm('');
						setSelectedTypes([]);
					}}
				>
					Reset
				</button>
			</div>

			{status === 'loading' && <EmptyState message="Loading Pokemon intel..." />}
			{status === 'error' && <EmptyState message={error ?? 'We could not reach the API.'} />}
			{status === 'success' && pokemon.length === 0 && <EmptyState message="No Pokemon matched your filters." />}

			{pokemon.length > 0 && (
				<div className="pokemon-layout">
					<div className="pokemon-grid">
						{pokemon.map((entry) => (
							<PokemonCard key={entry.nationalDex} pokemon={entry} onSelect={setSelectedDex} />
						))}
					</div>
					<PokemonDetailPanel
						pokemon={detail}
						status={detailStatus}
						error={detailError}
						onClose={() => setSelectedDex(null)}
					/>
				</div>
			)}
		</section>
	);
}

export default Pokedex;
