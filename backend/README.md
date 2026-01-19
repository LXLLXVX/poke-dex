# Backend API

API built with Express + MySQL that exposes CRUD operations for Pokémon, trainers, and types.

## Setup

1. Install dependencies:
   ```bash
   cd backend
   npm install
   ```
2. Copy `.env.example` to `.env` and adjust credentials. Two optional flags automate database setup when the server boots:
   - `DB_AUTO_MIGRATE=true` runs the migrations before the HTTP server starts.
   - `DB_AUTO_SEED=true` runs the seeders immediately after migrations. (Requires Node 18+ because the Pokémon seeder hits the public PokeAPI via `fetch`.)

## Database tasks

- `npm run migrate` applies the schema (`npm run migrate:down` rolls it back).
- `npm run seed` fills the tables (types, trainers, Pokémon).

You can still run these scripts manually even if the automation flags are disabled.

## REST endpoints

All responses follow `{ data: ... }` for successful payloads.

### Types `/api/types`
- `GET /` — list types.
- `POST /` — create. Body: `{ "name": "fire", "color": "#EE8130", "description": "Specializes in offense" }`.
- `PUT /:id` — update the type identified by numeric `id`.
- `DELETE /:id` — remove a type.

### Trainers `/api/trainers`
- `GET /` — list trainers.
- `POST /` — create. Body: `{ "name": "Misty", "hometown": "Cerulean City", "badgeCount": 4, "bio": "Water specialist" }`.
- `PUT /:id` — update by numeric `id`.
- `DELETE /:id` — remove by numeric `id` (also releases their Pokémon via the FK `ON DELETE SET NULL`).

### Pokémon `/api/pokemon`
- `GET /` — list with optional query params: `search`, `type`, `types[]`, `limit`, `offset`.
- `GET /:nationalDex` — fetch one Pokémon by its National Dex number.
- `POST /` — create. Body example:
  ```json
  {
    "nationalDex": 25,
    "name": "pikachu",
    "height": 4,
    "weight": 60,
    "baseExperience": 112,
    "spriteUrl": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png",
    "types": ["electric"],
    "abilities": [{ "name": "static", "isHidden": false }],
    "stats": [{ "name": "speed", "base": 90 }],
    "trainerId": 1
  }
  ```
- `PUT /:nationalDex` — update the Pokémon identified by its National Dex number. Any missing fields keep their previous values.
- `DELETE /:nationalDex` — remove the Pokémon (freeing up its Dex number for another record).

Errors bubble up as JSON `{ "message": "..." }` with meaningful HTTP codes (400 on validation, 404 when a record does not exist, 500 on unexpected failures).
