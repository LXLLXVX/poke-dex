const request = require('supertest');

// stub auth middleware so any protected route doesn't block tests
jest.mock('../src/middlewares/authMiddleware', () => ({
  authenticate: (req, res, next) => next(),
  authorizeRoles: () => (req, res, next) => next(),
}));

jest.mock('../src/services/pokemonService');

const app = require('../server');
const pokemonService = require('../src/services/pokemonService');

describe('Pokemon endpoints CRUD flow', () => {
  afterEach(() => jest.clearAllMocks());

  test('GET /api/pokemon lists pokemon with query', async () => {
    const sample = [{ nationalDex: 1, name: 'bulbasaur' }];
    pokemonService.listPokemon.mockResolvedValue(sample);

    const res = await request(app).get('/api/pokemon').query({ search: 'bulba', limit: 10 });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ data: sample });
    expect(pokemonService.listPokemon).toHaveBeenCalledWith({ search: 'bulba', type: undefined, types: undefined, limit: '10', offset: undefined });
  });

  test('GET /api/pokemon/:nationalDex returns pokemon or 404', async () => {
    const p = { nationalDex: 25, name: 'pikachu' };
    pokemonService.getPokemonByNationalDex.mockResolvedValue(p);

    const resOk = await request(app).get('/api/pokemon/25');
    expect(resOk.status).toBe(200);
    expect(resOk.body).toEqual({ data: p });

    pokemonService.getPokemonByNationalDex.mockResolvedValue(null);
    const resNot = await request(app).get('/api/pokemon/999');
    expect(resNot.status).toBe(404);
    expect(resNot.body).toEqual({ message: 'Pokémon not found' });
  });

  test('POST /api/pokemon creates pokemon (201) and handles validation error', async () => {
    const payload = { nationalDex: 10, name: 'caterpie', spriteUrl: 'http://img', types: ['bug'], abilities: [], stats: [], height: 3, weight: 29 };
    const created = { id: 123, ...payload };
    pokemonService.createPokemon.mockResolvedValue(created);

    const res = await request(app).post('/api/pokemon').send(payload);
    expect(res.status).toBe(201);
    expect(res.body).toEqual({ data: created });

    pokemonService.createPokemon.mockRejectedValue({ status: 400, message: 'spriteUrl is required' });
    const resErr = await request(app).post('/api/pokemon').send({});
    expect(resErr.status).toBe(400);
    expect(resErr.body).toEqual({ message: 'spriteUrl is required' });
  });

  test('PUT /api/pokemon/:nationalDex updates pokemon or returns 404', async () => {
    const updated = { nationalDex: 4, name: 'charmander' };
    pokemonService.updatePokemon.mockResolvedValue(updated);

    const res = await request(app).put('/api/pokemon/4').send({ name: 'charmander' });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ data: updated });

    pokemonService.updatePokemon.mockRejectedValue({ status: 404, message: 'Pokémon not found' });
    const res404 = await request(app).put('/api/pokemon/999').send({ name: 'x' });
    expect(res404.status).toBe(404);
    expect(res404.body).toEqual({ message: 'Pokémon not found' });
  });

  test('DELETE /api/pokemon/:nationalDex deletes (204) or returns 404', async () => {
    pokemonService.deletePokemon.mockResolvedValue();
    const res = await request(app).delete('/api/pokemon/7');
    expect(res.status).toBe(204);

    pokemonService.deletePokemon.mockRejectedValue({ status: 404, message: 'Pokémon not found' });
    const res404 = await request(app).delete('/api/pokemon/9999');
    expect(res404.status).toBe(404);
    expect(res404.body).toEqual({ message: 'Pokémon not found' });
  });
});
