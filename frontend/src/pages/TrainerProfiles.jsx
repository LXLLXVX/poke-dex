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

function LoginPanel({ onLogin, isSubmitting, feedback }) {
	const [credentials, setCredentials] = useState({ username: '', password: '' });

	const handleSubmit = (event) => {
		event.preventDefault();
		onLogin?.(credentials);
	};

	return (
		<form className="team-form auth-form" onSubmit={handleSubmit}>
			<header>
				<p className="eyebrow">Sesion requerida</p>
				<h3>Inicia sesion para CRUD de trainers</h3>
			</header>
			<label htmlFor="auth-username">
				Usuario
				<input
					id="auth-username"
					name="username"
					value={credentials.username}
					onChange={(event) => setCredentials((prev) => ({ ...prev, username: event.target.value }))}
					autoComplete="username"
					disabled={isSubmitting}
				/>
			</label>
			<label htmlFor="auth-password">
				Password
				<input
					id="auth-password"
					type="password"
					name="password"
					value={credentials.password}
					onChange={(event) => setCredentials((prev) => ({ ...prev, password: event.target.value }))}
					autoComplete="current-password"
					disabled={isSubmitting}
				/>
			</label>
			<button type="submit" className="ghost" disabled={isSubmitting}>
				{isSubmitting ? 'Ingresando...' : 'Ingresar'}
			</button>
			{feedback && <p className="inline-error">{feedback}</p>}
			<p className="muted">Demo: admin/admin123 o misty/misty123</p>
		</form>
	);
}

function TrainerProfiles() {
	const [trainers, setTrainers] = useState([]);
	const [status, setStatus] = useState('idle');
	const [error, setError] = useState(null);
	const [selectedId, setSelectedId] = useState(null);
	const [authUser, setAuthUser] = useState(null);
	const [authStatus, setAuthStatus] = useState('checking');
	const [authFeedback, setAuthFeedback] = useState(null);

	const loadTrainers = async (signal) => {
		setStatus('loading');
		setError(null);

		const response = await fetch(`${API_BASE_URL}/trainers`, {
			signal,
			credentials: 'include',
		});
		if (!response.ok) {
			const payload = await response.json().catch(() => ({}));
			throw new Error(payload.message ?? 'Unable to load trainers');
		}

		const payload = await response.json();
		const data = Array.isArray(payload.data) ? payload.data : [];
		setTrainers(data);
		setSelectedId((prev) => prev ?? (data[0]?.id ?? null));
		setStatus('success');
	};

	useEffect(() => {
		const controller = new AbortController();

		async function checkSession() {
			try {
				const response = await fetch(`${API_BASE_URL}/auth/me`, {
					signal: controller.signal,
					credentials: 'include',
				});
				if (response.status === 401) {
					setAuthUser(null);
					setAuthStatus('guest');
					setStatus('idle');
					return;
				}
				if (!response.ok) throw new Error('Unable to validate session');

				const payload = await response.json();
				setAuthUser(payload.data?.user ?? null);
				setAuthStatus('authenticated');
				await loadTrainers(controller.signal);
			} catch (err) {
				if (err.name === 'AbortError') return;
				setAuthStatus('guest');
				setAuthUser(null);
			}
		}

		checkSession();
		return () => controller.abort();
	}, []);

	const handleLogin = async ({ username, password }) => {
		setAuthFeedback(null);
		setAuthStatus('submitting');

		try {
			const response = await fetch(`${API_BASE_URL}/auth/login`, {
				method: 'POST',
				credentials: 'include',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ username, password }),
			});

			if (!response.ok) {
				const payload = await response.json().catch(() => ({}));
				throw new Error(payload.message ?? 'Credenciales invalidas');
			}

			const payload = await response.json();
			setAuthUser(payload.data?.user ?? null);
			setAuthStatus('authenticated');
			await loadTrainers();
		} catch (loginError) {
			setAuthFeedback(loginError.message ?? 'No fue posible iniciar sesion');
			setAuthStatus('guest');
		}
	};

	const handleLogout = async () => {
		await fetch(`${API_BASE_URL}/auth/logout`, {
			method: 'POST',
			credentials: 'include',
		});
		setAuthUser(null);
		setAuthStatus('guest');
		setTrainers([]);
		setSelectedId(null);
	};

	const { badgeAverage } = useMemo(() => {
		if (!trainers.length) return { badgeAverage: 0 };
		const total = trainers.reduce((sum, trainer) => sum + (trainer.badgeCount ?? 0), 0);
		return {
			badgeAverage: Math.round((total / trainers.length) * 10) / 10,
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
						CRUD de entrenadores protegido con sesiones y cookies. Inicia sesion para consultar y gestionar datos.
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
						<span>Sesion</span>
						<strong>{authUser?.username ?? 'Sin login'}</strong>
					</div>
				</div>
			</header>

			{authStatus !== 'authenticated' && (
				<LoginPanel onLogin={handleLogin} isSubmitting={authStatus === 'submitting'} feedback={authFeedback} />
			)}

			{authStatus === 'authenticated' && (
				<div className="trainer-session-bar">
					<p className="muted">Sesion activa como {authUser?.username} ({authUser?.role})</p>
					<button type="button" className="ghost ghost--muted" onClick={handleLogout}>
						Cerrar sesion
					</button>
				</div>
			)}

			{authStatus === 'authenticated' && status === 'loading' && <EmptyState message="Loading trainer dossiers..." />}
			{authStatus === 'authenticated' && status === 'error' && <EmptyState message={error ?? 'Unable to reach trainer endpoint.'} />}

			{authStatus === 'authenticated' && status === 'success' && (
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

			{authStatus === 'guest' && <EmptyState message="Debes iniciar sesion para ver el CRUD de entrenadores." />}
		</section>
	);
}

export default TrainerProfiles;
