import { useEffect, useState } from 'react';

const EMPTY_FORM = {
	name: '',
	color: '',
	description: '',
};

function TypeForm({ initialValues, onSubmit, onCancel, isEditing, disabled }) {
	const [formValues, setFormValues] = useState(EMPTY_FORM);
	const [localError, setLocalError] = useState(null);

	useEffect(() => {
		if (initialValues) {
			setFormValues({
				name: initialValues.name ?? '',
				color: initialValues.color ?? '',
				description: initialValues.description ?? '',
			});
		} else {
			setFormValues(EMPTY_FORM);
		}
		setLocalError(null);
	}, [initialValues]);

	const handleChange = (event) => {
		const { name, value } = event.target;
		setFormValues((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = (event) => {
		event.preventDefault();
		const trimmedName = formValues.name.trim();
		if (!trimmedName) {
			setLocalError('Name is required.');
			return;
		}

		setLocalError(null);
		onSubmit?.({
			name: trimmedName,
			color: formValues.color.trim() || null,
			description: formValues.description.trim() || null,
		});
	};

	const handleClearColor = () => {
		if (disabled) return;
		setFormValues((prev) => ({ ...prev, color: '' }));
	};

	const colorPreview = formValues.color.trim() || '#ffe5ef';

	return (
		<form className="team-form type-form" onSubmit={handleSubmit}>
			<header>
				<p className="eyebrow">{isEditing ? 'Edit type' : 'New type'}</p>
				<h3>{isEditing ? 'Update the record' : 'Register a type'}</h3>
			</header>
			<label htmlFor="type-name">
				Canonical name
				<input
					id="type-name"
					name="name"
					value={formValues.name}
					onChange={handleChange}
					placeholder="Ex. fire"
					autoComplete="off"
					disabled={disabled}
				/>
			</label>
			<label htmlFor="type-color" className="type-color-label">
				Color (hex or CSS keyword)
				<div className="type-color-field">
					<input
						id="type-color"
						name="color"
						value={formValues.color}
						onChange={handleChange}
						placeholder="#FFAA00"
						autoComplete="off"
						disabled={disabled}
					/>
					<span className="type-color-preview" style={{ background: colorPreview }} aria-hidden="true" />
					<button
						type="button"
						className="ghost ghost--muted"
						onClick={handleClearColor}
						disabled={disabled || !formValues.color.trim()}
					>
						Clear color
					</button>
				</div>
			</label>
			<label htmlFor="type-description">
				Tactical note
				<textarea
					id="type-description"
					name="description"
					rows={3}
					value={formValues.description}
					onChange={handleChange}
					placeholder="Recommended coverage, rivalries, etc."
					disabled={disabled}
				/>
			</label>
			{localError && <p className="inline-error">{localError}</p>}
			<div className="form-actions">
				<button type="submit" className="ghost" disabled={disabled}>
					{isEditing ? 'Save changes' : 'Add type'}
				</button>
				{isEditing && onCancel && (
					<button type="button" className="ghost ghost--muted" onClick={onCancel} disabled={disabled}>
						Cancel
					</button>
				)}
			</div>
		</form>
	);
}

export default TypeForm;
