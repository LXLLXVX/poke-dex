# Poke Team Lab

Full-stack playground that recreates the original Generation I Pokédex experience. It includes:

- **Backend**: Node.js + Express API with MySQL for CRUD operations on Pokémon, trainers, and types. Includes migrations/seeders (with PokeAPI import) and optional auto-setup flags.
- **Frontend**: Vite + React single-page app that lists Pokémon with filters and a detailed dossier panel per Pokémon.
- **Infrastructure**: Docker Compose recipe for a local MySQL 8.0 instance.

## Tech Stack

| Layer     | Technologies |
|-----------|--------------|
| Backend   | Node.js 18+, Express 5, MySQL2, dotenv, cors |
| Frontend  | React + Vite, modern CSS (no UI framework) |
| Database  | MySQL 8 (Dockerized) |

## Prerequisites

- Node.js 18 or newer
- npm 10+
- Docker Desktop (or a self-managed MySQL instance)

## Getting Started

1. **Clone the repo**
   ```bash
   git clone https://github.com/LXLLXVX/poke-dex.git
   cd poke-dex
   ```
2. **Run MySQL via Docker**
   ```bash
   docker compose up -d mysql
   ```
   The instance exposes port `3306` with credentials defined in `backend/.env.example`.
3. **Install dependencies**
   ```bash
   npm install --prefix backend
   npm install --prefix frontend
   ```
4. **Configure environment**
   - Copy `backend/.env.example` to `backend/.env` and adjust DB credentials if needed.
   - Optional flags: `DB_AUTO_MIGRATE=true` / `DB_AUTO_SEED=true` to run migrations/seeders at startup.
5. **Prepare the database**
   ```bash
   cd backend
   npm run migrate
   npm run seed
   ```
   Seeders fetch the 151 Gen-I Pokémon from the public PokeAPI, so you need internet access.
6. **Run the backend**
   ```bash
   npm start
   ```
   API will be available at `http://localhost:4000`.
7. **Run the frontend**
   ```bash
   cd ../frontend
   npm run dev
   ```
   Vite will launch (default `http://localhost:5173`, or next available port).

## Backend Overview

### Available Scripts
- `npm run migrate` – apply schema migrations.
- `npm run migrate:down` – roll back.
- `npm run seed` – populate types, trainers, and fetch+store Gen 1 Pokémon.
- `npm start` – start the Express server.

### REST Endpoints
`/api/pokemon`
- `GET /` – list Pokémon with `search`, `type`, `types[]`, `limit`, `offset` filters.
- `POST /` – create Pokémon with stats/abilities/typing.
- `GET /:nationalDex` – fetch single Pokémon by National Dex number.
- `PUT /:nationalDex` – update existing Pokémon record.
- `DELETE /:nationalDex` – remove Pokémon.

`/api/trainers`
- Full CRUD via `GET/POST/PUT/DELETE /api/trainers(/:id)`.

`/api/types`
- Full CRUD via `GET/POST/PUT/DELETE /api/types(/:id)`.

All success responses follow `{ "data": ... }`. Errors follow `{ "message": "..." }` with proper HTTP status codes.

## Frontend Overview

- The Pokédex page allows searching and filtering by type. Clicking any Pokémon shows its detailed stats, types, abilities (base + hidden), and trainer assignment.
- Additional placeholder routes exist for trainers, team builder, and type insights.

## Project Structure

```
backend/        Express API, database layer, migrations & seeders
frontend/       React application (Vite)
docs/           Supplementary documentation/diagrams
docker-compose.yml  Local MySQL service
```

## Testing & Linting

- No automated test suite yet. Manual verification is recommended after data changes.
- Consider adding Jest (backend) and Vitest/React Testing Library (frontend) for future coverage.

## Deployment Notes

- Ensure the production environment has Node 18+, MySQL 8, and proper environment variables.
- The Pokémon seeder hits `https://pokeapi.co`, so provide network access or replace it with a cached dataset for deterministic deploys.

## License

MIT (adjust as needed).
