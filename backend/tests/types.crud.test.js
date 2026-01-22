const request = require('supertest');

jest.mock('../src/services/typeService');

const app = require('../server');
const typeService = require('../src/services/typeService');

describe('Type endpoints CRUD flow', () => {
	afterEach(() => {
		jest.clearAllMocks();
	});

	test('GET /api/types lists the available types', async () => {
		const sampleTypes = [
			{ id: 1, name: 'fire', color: '#FF0000', description: 'Burns bright' },
			{ id: 2, name: 'water', color: '#0000FF', description: 'Goes with the flow' },
		];
		typeService.listTypes.mockResolvedValue(sampleTypes);

		const response = await request(app).get('/api/types');

		expect(response.status).toBe(200);
		expect(response.body).toEqual({ data: sampleTypes });
		expect(typeService.listTypes).toHaveBeenCalledTimes(1);
	});

	test('POST /api/types creates a new type', async () => {
		const payload = { name: 'psychic', color: '#F85888', description: 'Mind tricks' };
		const created = { id: 15, ...payload };
		typeService.createType.mockResolvedValue(created);

		const response = await request(app).post('/api/types').send(payload);

		expect(response.status).toBe(201);
		expect(response.body).toEqual({ data: created });
		expect(typeService.createType).toHaveBeenCalledWith(payload);
	});

	test('PUT /api/types/:id updates an existing type', async () => {
		const payload = { name: 'electric', color: '#F7D02C', description: 'Zap' };
		const updated = { id: 4, ...payload };
		typeService.updateType.mockResolvedValue(updated);

		const response = await request(app).put('/api/types/4').send(payload);

		expect(response.status).toBe(200);
		expect(response.body).toEqual({ data: updated });
		expect(typeService.updateType).toHaveBeenCalledWith('4', payload);
	});

	test('DELETE /api/types/:id removes a type', async () => {
		typeService.deleteType.mockResolvedValue();

		const response = await request(app).delete('/api/types/7');

		expect(response.status).toBe(204);
		expect(response.text).toBe('');
		expect(typeService.deleteType).toHaveBeenCalledWith('7');
	});
});
