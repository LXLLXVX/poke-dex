const request = require('supertest');

// mock auth middleware to set an admin user for protected trainer routes
jest.mock('../src/middlewares/authMiddleware', () => ({
  authenticate: (req, res, next) => {
    req.auth = { user: { role: 'admin' } };
    return next();
  },
  authorizeRoles: (...roles) => (req, res, next) => {
    return next();
  },
}));

jest.mock('../src/services/trainerService');

const app = require('../server');
const trainerService = require('../src/services/trainerService');

describe('Trainer endpoints CRUD flow', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('GET /api/trainers lists trainers', async () => {
    const sample = [
      { id: 1, name: 'Ash' },
      { id: 2, name: 'Misty' },
    ];
    trainerService.listTrainers.mockResolvedValue(sample);

    const res = await request(app).get('/api/trainers');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ data: sample });
    expect(trainerService.listTrainers).toHaveBeenCalledTimes(1);
  });

  test('POST /api/trainers creates trainer (success)', async () => {
    const payload = { name: 'Brock', hometown: 'Pewter' };
    const created = { id: 7, ...payload };
    trainerService.createTrainer.mockResolvedValue(created);

    const res = await request(app).post('/api/trainers').send(payload);

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ data: created });
    expect(trainerService.createTrainer).toHaveBeenCalledWith(payload);
  });

  test('POST /api/trainers returns validation error (400)', async () => {
    const payload = { name: '' };
    trainerService.createTrainer.mockRejectedValue({ status: 400, message: 'Trainer name is required' });

    const res = await request(app).post('/api/trainers').send(payload);

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ message: 'Trainer name is required' });
  });

  test('PUT /api/trainers/:id updates trainer (success)', async () => {
    const payload = { hometown: 'Pallet' };
    const updated = { id: 3, name: 'Gary', hometown: 'Pallet' };
    trainerService.updateTrainer.mockResolvedValue(updated);

    const res = await request(app).put('/api/trainers/3').send(payload);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ data: updated });
    expect(trainerService.updateTrainer).toHaveBeenCalledWith('3', payload);
  });

  test('PUT /api/trainers/:id returns 404 when not found', async () => {
    trainerService.updateTrainer.mockRejectedValue({ status: 404, message: 'Trainer not found' });

    const res = await request(app).put('/api/trainers/999').send({ name: 'Noone' });

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ message: 'Trainer not found' });
  });

  test('DELETE /api/trainers/:id deletes trainer (204)', async () => {
    trainerService.deleteTrainer.mockResolvedValue();

    const res = await request(app).delete('/api/trainers/5');

    expect(res.status).toBe(204);
    expect(res.text).toBe('');
    expect(trainerService.deleteTrainer).toHaveBeenCalledWith('5');
  });

  test('DELETE /api/trainers/:id returns 404 when not found', async () => {
    trainerService.deleteTrainer.mockRejectedValue({ status: 404, message: 'Trainer not found' });

    const res = await request(app).delete('/api/trainers/9999');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ message: 'Trainer not found' });
  });
});
