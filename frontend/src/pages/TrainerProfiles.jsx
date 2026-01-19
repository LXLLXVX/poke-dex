import { useEffect, useMemo, useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api';
const FALLBACK_PORTRAIT = '/trainer-silhouette.svg';

function TrainerCard({ trainer, onSelect, isActive }) {
	return (
		<article
			className={`trainer-card${isActive ? ' is-active' : ''}`}
			onClick={() => onSelect?.(trainer.id)}
			onKeyDown={(event) => {
				if (event.key === 'Enter' || event.key === ' ') {
					event.preventDefault();
					onSelect?.(trainer.id);
				}
			}}
			tabIndex={0}
			role="button"
			aria-pressed={isActive}
		>
			<img src={trainer.portraitUrl ?? FALLBACK_PORTRAIT} alt={trainer.name} loading="lazy" width="96" height="96" />
			<div>
				<p className="eyebrow">{trainer.badgeCount} badges</p>
				<h3>{trainer.name}</h3>
				<p className="muted">{trainer.hometown ?? 'Unknown origin'}</p>
			</div>
		</article>
	);
}

function TrainerSpotlight({ trainer, status, error }) {
	if (status === 'loading') {
		return <p className="muted">Syncing Elite intel...</p>;
	}

	if (status === 'error') {
		return <p className="error">{error ?? 'Unable to fetch trainer dossier.'}</p>;
	}

	if (!trainer) {
		return <p className="muted">Select a trainer card to load their tactical dossier.</p>;
	}

	return (
		<article className="trainer-spotlight">
			<header>
				<div>
					<p className="eyebrow">{trainer.badgeCount} official badges</p>
					<h3>{trainer.name}</h3>
				</div>
				<img src={trainer.portraitUrl ?? FALLBACK_PORTRAIT} alt={trainer.name} width="140" height="140" />
			</header>
			<section>
				<h4>Bio</h4>
				<p>{trainer.bio ?? 'No biography available yet.'}</p>
			</section>
			<section className="trainer-spotlight__grid">
				<div>
					<span>Hometown</span>
					<strong>{trainer.hometown ?? 'Unknown'}</strong>
				</div>
				<div>
					<span>Role</span>
					<strong>{trainer.badgeCount >= 8 ? 'Elite / Champion' : 'Gym Leader'}</strong>
				</div>
				<div>
					<span>Roster slots</span>
					<strong>{trainer.badgeCount >= 8 ? '6 (full)' : '4-6'}</strong>
				</div>
			</section>
		</article>
	);
}

function EmptyState({ message }) {
	return (
		<div className="empty-state">
			<p>{message}</p>
		</div>
	);
}

function TrainerProfiles() {
	const [trainers, setTrainers] = useState([]);
	const [status, setStatus] = useState('idle');
	const [error, setError] = useState(null);
	const [selectedId, setSelectedId] = useState(null);

	useEffect(() => {
		const controller = new AbortController();
		setStatus('loading');
		setError(null);

		async function loadTrainers() {
			try {
				const response = await fetch(`${API_BASE_URL}/trainers`, { signal: controller.signal });
				if (!response.ok) throw new Error('Unable to load trainers');
				const payload = await response.json();
				const data = Array.isArray(payload.data) ? payload.data : [];
				setTrainers(data);
				setSelectedId((prev) => prev ?? (data[0]?.id ?? null));
				setStatus('success');
			} catch (err) {
				if (err.name === 'AbortError') return;
				setError(err.message);
				setStatus('error');
			}
		}

		loadTrainers();
		return () => controller.abort();
	}, []);

	const { badgeAverage, eliteCount } = useMemo(() => {
		if (!trainers.length) return { badgeAverage: 0, eliteCount: 0 };
		const total = trainers.reduce((sum, trainer) => sum + (trainer.badgeCount ?? 0), 0);
		const elite = trainers.filter((trainer) => (trainer.badgeCount ?? 0) >= 8).length;
		return {
			badgeAverage: Math.round((total / trainers.length) * 10) / 10,
			eliteCount: elite,
		};
	}, [trainers]);

	const activeTrainer = trainers.find((trainer) => trainer.id === selectedId) ?? null;

	return (
		<section className="trainer-profiles">
			<header className="trainer-hero">
				<div>
					<p className="eyebrow">Kanto leadership board</p>
					<h2>Meet the Generation I trainers.</h2>
					<p className="subtitle">
						Every profile ships with canonical hometown intel, official badge counts, and a portrait pulled from the generation
						lore.
					</p>
				</div>
				<div className="trainer-hero__stats">
					<div>
						<span>Total dossiers</span>
						<strong>{trainers.length}</strong>
					</div>
					<div>
						<span>Avg badge cache</span>
						<strong>{badgeAverage}</strong>
					</div>
					<div>
						<span>Elite 4 / Champion</span>
						<strong>{eliteCount}</strong>
					</div>
				</div>
			</header>

			{status === 'loading' && <EmptyState message="Loading trainer dossiers..." />}
			{status === 'error' && <EmptyState message={error ?? 'Unable to reach trainer endpoint.'} />}

			{status === 'success' && (
				<div className="trainer-layout">
					<div className="trainer-grid">
						{trainers.map((trainer) => (
							<TrainerCard
								key={trainer.id}
								trainer={trainer}
								onSelect={setSelectedId}
								isActive={trainer.id === selectedId}
							/>
						))}
					</div>
					<TrainerSpotlight trainer={activeTrainer} status={status} error={error} />
				</div>
			)}
		</section>
	);
}

export default TrainerProfiles;
