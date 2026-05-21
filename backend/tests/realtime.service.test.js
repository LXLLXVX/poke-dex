const { setRealtimeServer, publishActivity } = require('../src/services/realtimeService');

describe('realtimeService', () => {
	afterEach(() => {
		setRealtimeServer(null);
	});

	test('publishActivity emits activity payload through io', () => {
		const emit = jest.fn();
		setRealtimeServer({ emit });

		publishActivity({ type: 'pokemon', action: 'created', message: 'Nuevo Pokémon registrado' });

		expect(emit).toHaveBeenCalledTimes(1);
		expect(emit.mock.calls[0][0]).toBe('activity');
		expect(emit.mock.calls[0][1]).toEqual(
			expect.objectContaining({
				type: 'pokemon',
				action: 'created',
				message: 'Nuevo Pokémon registrado',
				timestamp: expect.any(String),
			}),
		);
	});
});