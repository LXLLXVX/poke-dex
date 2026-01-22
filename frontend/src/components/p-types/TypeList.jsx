function TypeList({ types, onSelect, selectedId, emptyMessage }) {
	if (!types.length) {
		return (
			<div className="empty-state">
				<p>{emptyMessage ?? 'No types registered yet. Add one to get started.'}</p>
			</div>
		);
	}

	return (
		<div className="type-grid" role="list">
			{types.map((type) => {
				const isActive = selectedId === type.id;
				const color = type.color?.trim() || 'var(--pixel-highlight)';
				const colorLabel = type.color?.trim() || 'auto';
				const updatedLabel = (() => {
					if (!type.updatedAt) return 'No date';
					const parsed = new Date(type.updatedAt);
					return Number.isNaN(parsed.getTime()) ? 'No date' : parsed.toLocaleDateString();
				})();
				return (
					<article
						key={type.id ?? type.name}
						className={`type-card${isActive ? ' is-active' : ''}`}
						role="listitem"
					>
						<button
							type="button"
							className="type-card__body"
							onClick={() => onSelect?.(type)}
							onKeyDown={(event) => {
								if (event.key === 'Enter' || event.key === ' ') {
									event.preventDefault();
									onSelect?.(type);
								}
							}}
						>
							<div className="type-card__heading">
								<p className="eyebrow">#{String(type.id ?? '??').padStart(2, '0')}</p>
								<h3>{type.name}</h3>
							</div>
							<div className="type-card__swatch" style={{ background: color }} aria-hidden="true" />
							<p className="type-card__description">{type.description ?? 'No notes yet.'}</p>
							<footer className="type-card__footer">
								<span>Color: {colorLabel}</span>
								<span>{updatedLabel}</span>
							</footer>
						</button>
					</article>
				);
			})}
		</div>
	);
}

export default TypeList;
