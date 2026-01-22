function TypeTable({ types, onEdit, onDelete }) {
	if (!types.length) {
		return null;
	}

	return (
		<div className="type-table-wrapper">
			<header className="type-table__header">
				<h3>Reference table</h3>
				<p className="muted">Detailed roster of every type currently stored in the local database.</p>
			</header>
			<div className="type-table__scroll">
				<table className="type-table">
					<thead>
						<tr>
							<th>Type</th>
							<th>Color</th>
							<th>Notes</th>
							<th className="type-table__actions-heading">Actions</th>
						</tr>
					</thead>
					<tbody>
						{types.map((type) => (
							<tr key={type.id ?? type.name}>
								<td>
									<div className="type-table__name">
										<span className="type-color-preview" style={{ background: type.color?.trim() || 'var(--pixel-highlight)' }} aria-hidden="true" />
										<div>
											<strong>{type.name}</strong>
											<p>ID #{String(type.id ?? '??').padStart(2, '0')}</p>
										</div>
									</div>
								</td>
								<td>{type.color?.trim() || 'Auto'}</td>
								<td>{type.description ?? '—'}</td>
								<td className="type-table__actions-cell">
									<button type="button" className="ghost" onClick={() => onEdit?.(type)}>
										Edit
									</button>
									<button type="button" className="ghost ghost--danger" onClick={() => onDelete?.(type)}>
										Delete
									</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}

export default TypeTable;
