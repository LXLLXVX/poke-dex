import { useCallback, useEffect, useMemo, useState } from 'react';
import TypeForm from '../components/p-types/TypeForm';
import TypeList from '../components/p-types/TypeList';
import TypeTable from '../components/p-types/TypeTable';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api';

function TypeInsights() {
	const [types, setTypes] = useState([]);
	const [status, setStatus] = useState('idle');
	const [error, setError] = useState(null);
	const [selectedId, setSelectedId] = useState(null);
	const [filter, setFilter] = useState('');
	const [formStatus, setFormStatus] = useState('idle');
	const [feedback, setFeedback] = useState(null);
	const [refreshing, setRefreshing] = useState(false);

	const loadTypes = useCallback(
		async ({ signal, silent = false } = {}) => {
			if (!silent) {
				setStatus('loading');
				setError(null);
			} else {
				setRefreshing(true);
			}

			try {
				const response = await fetch(`${API_BASE_URL}/types`, { signal });
				if (!response.ok) throw new Error('Unable to load types.');
				const payload = await response.json();
				setTypes(Array.isArray(payload.data) ? payload.data : []);
				setStatus('ready');
				setError(null);
			} catch (err) {
				if (err.name === 'AbortError') return;
				if (!silent) {
					setError(err.message);
					setStatus('error');
				} else {
					setFeedback(err.message ?? 'Unable to refresh type list.');
				}
			} finally {
				if (silent) {
					setRefreshing(false);
				}
			}
		},
		[]
	);

	useEffect(() => {
		const controller = new AbortController();
		loadTypes({ signal: controller.signal });
		return () => controller.abort();
	}, [loadTypes]);

	useEffect(() => {
		if (!feedback) return undefined;
		const timer = setTimeout(() => setFeedback(null), 4000);
		return () => clearTimeout(timer);
	}, [feedback]);

	const selectedType = useMemo(() => types.find((type) => type.id === selectedId) ?? null, [types, selectedId]);

	const trimmedFilter = filter.trim();
	const filteredTypes = useMemo(() => {
		const term = trimmedFilter.toLowerCase();
		if (!term) return types;
		return types.filter((type) => {
			const name = type.name?.toLowerCase() ?? '';
			const description = type.description?.toLowerCase() ?? '';
			return name.includes(term) || description.includes(term);
		});
	}, [trimmedFilter, types]);

	const hasFilter = Boolean(trimmedFilter);

	const summary = useMemo(() => {
		const total = types.length;
		const described = types.filter((type) => Boolean(type.description?.trim())).length;
		const colored = types.filter((type) => Boolean(type.color?.trim())).length;
		const documentation = total ? Math.round((described / total) * 100) : 0;
		return { total, described, colored, documentation };
	}, [types]);

	const handleSelectType = (type) => {
		setSelectedId(type?.id ?? null);
		if (typeof window !== 'undefined') {
			window.scrollTo({ top: 0, behavior: 'smooth' });
		}
	};

	const handleCancelEdit = () => setSelectedId(null);

	const handleRefresh = () => {
		loadTypes({ silent: true });
	};

	const handleSubmit = async (formValues) => {
		setFormStatus('submitting');
		setFeedback(null);
		try {
			const isEditing = Boolean(selectedType);
			const endpoint = isEditing ? `${API_BASE_URL}/types/${selectedType.id}` : `${API_BASE_URL}/types`;
			const method = isEditing ? 'PUT' : 'POST';
			const response = await fetch(endpoint, {
				method,
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(formValues),
			});

			if (!response.ok) {
				const payload = await response.json().catch(() => ({}));
				throw new Error(payload.message ?? 'Unable to save the type.');
			}

			await loadTypes({ silent: true });
			setSelectedId(null);
			setFeedback(isEditing ? 'Type updated successfully.' : 'Type added to the Dex.');
		} catch (err) {
			setFeedback(err.message ?? 'Unable to save the type.');
		} finally {
			setFormStatus('idle');
		}
	};

	const handleDelete = async (type) => {
		if (!type) return;
		const confirmation = window.confirm(`Are you sure you want to delete the type ${type.name}?`);
		if (!confirmation) return;

		try {
			const response = await fetch(`${API_BASE_URL}/types/${type.id}`, {
				method: 'DELETE',
			});
			if (!response.ok) {
				const payload = await response.json().catch(() => ({}));
				throw new Error(payload.message ?? 'Unable to delete the type.');
			}
			await loadTypes({ silent: true });
			if (selectedId === type.id) {
				setSelectedId(null);
			}
			setFeedback('Type deleted.');
		} catch (err) {
			setFeedback(err.message ?? 'Unable to delete the type.');
		}
	};

	return (
		<section className="type-insights">
			<header className="type-hero">
				<div>
					<p className="eyebrow">Elemental analytics · Gen I</p>
					<h2>Command the type matrix.</h2>
					<p className="subtitle">
						Maintain the official chart, log palettes, and ship notes to the rest of the tactics lab.
					</p>
				</div>
				<div className="type-hero__stats">
					<div>
						<span>Types tracked</span>
						<strong>{summary.total}</strong>
					</div>
					<div>
						<span>Custom palette</span>
						<strong>{summary.colored}</strong>
					</div>
					<div>
						<span>Notes on file</span>
						<strong>{summary.described}</strong>
					</div>
					<div>
						<span>Documentation</span>
						<strong>{summary.documentation}%</strong>
					</div>
				</div>
			</header>

			<div className="type-toolbar">
				<div className="search-field">
					<label htmlFor="type-filter">Filter types</label>
					<input
						id="type-filter"
						type="search"
						placeholder="Search by name or description"
						value={filter}
						onChange={(event) => setFilter(event.target.value)}
					/>
				</div>
				<div className="type-toolbar__counter">
					<span>Visible</span>
					<strong>{filteredTypes.length}</strong>
				</div>
				<button type="button" className="ghost" onClick={handleRefresh} disabled={refreshing || status === 'loading'}>
					{refreshing ? 'Refreshing...' : 'Refresh'}
				</button>
			</div>

			{feedback && <p className="muted type-feedback">{feedback}</p>}

			{status === 'loading' && types.length === 0 && (
				<div className="empty-state">
					<p>Syncing the type table...</p>
				</div>
			)}

			{status === 'error' && (
				<div className="empty-state">
					<p className="error">{error ?? 'We could not reach the type endpoint.'}</p>
					<button type="button" className="ghost" onClick={() => loadTypes()}>
						Retry
					</button>
				</div>
			)}

			{status === 'ready' && (
				<>
					<div className="type-layout">
						<TypeList
							types={filteredTypes}
							selectedId={selectedId}
							onSelect={handleSelectType}
							emptyMessage={hasFilter ? 'No type matches your current filter.' : 'No types registered yet. Add one to get started.'}
						/>
						<aside className="type-sidebar">
							<TypeForm
								key={selectedType?.id ?? 'new'}
								initialValues={selectedType}
								onSubmit={handleSubmit}
								onCancel={selectedType ? handleCancelEdit : undefined}
								isEditing={Boolean(selectedType)}
								disabled={formStatus === 'submitting'}
							/>
						</aside>
					</div>
					<TypeTable types={filteredTypes} onEdit={handleSelectType} onDelete={handleDelete} />
				</>
			)}
		</section>
	);
}

export default TypeInsights;
