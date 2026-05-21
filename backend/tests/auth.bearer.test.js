const request = require('supertest');

jest.mock('../src/services/authService', () => ({
	loginWithPassword: jest.fn(),
	verifyToken: jest.fn(),
	validateCredentials: jest.fn(),
}));

const app = require('../server');
const authService = require('../src/services/authService');

describe('Auth bearer flow', () => {
	afterEach(() => {
		jest.clearAllMocks();
	});

	test('POST /api/auth/login returns a bearer token', async () => {
		authService.loginWithPassword.mockResolvedValue({
			user: { id: 1, username: 'admin', role: 'admin' },
			token: 'signed-token',
		});

		const response = await request(app).post('/api/auth/login').send({ username: 'admin', password: 'admin123' });

		expect(response.status).toBe(200);
		expect(response.body).toEqual({
			data: {
				user: { id: 1, username: 'admin', role: 'admin' },
				token: 'signed-token',
			},
		});
	});

	test('GET /api/auth/me resolves the bearer token', async () => {
		authService.verifyToken.mockReturnValue({ sub: 1, username: 'admin', role: 'admin' });

		const response = await request(app)
			.get('/api/auth/me')
			.set('Authorization', 'Bearer signed-token');

		expect(response.status).toBe(200);
		expect(response.body).toEqual({
			data: {
				user: { id: 1, username: 'admin', role: 'admin' },
				via: 'bearer',
			},
		});
	});

	test('POST /api/auth/logout accepts bearer token and returns 204', async () => {
		authService.verifyToken.mockReturnValue({ sub: 1, username: 'admin', role: 'admin' });

		const response = await request(app)
			.post('/api/auth/logout')
			.set('Authorization', 'Bearer signed-token');

		expect(response.status).toBe(204);
		expect(response.text).toBe('');
	});
});