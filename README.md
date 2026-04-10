# Poke Team Lab

Full-stack application inspired by the original Gen I Pokedex, built with a REST API, MySQL, and a React frontend.

## What is included

- Node.js + Express backend with CRUD for Pokemon, Trainers, Types, and Team.
- MySQL 8 database with migrations and seeders.
- Gen I Pokemon importer from PokeAPI.
- React + Vite frontend with routes for Pokedex, Team Builder, Trainer Profiles, and Type Insights.
- Docker Compose setup for local MySQL.

## Tech stack

| Layer | Technologies |
|------|-------------|
| Backend | Node.js 18+, Express 5, mysql2, dotenv, cors |
| Frontend | React 19, React Router 7, Vite 7 |
| Database | MySQL 8 (Docker) |
| Testing | Jest + Supertest (backend, partial coverage) |

## Requirements

- Node.js 18 or newer
- npm 10+
- Docker Desktop (recommended for MySQL)

## Quick start

1. Install dependencies:

```bash
npm install --prefix backend
npm install --prefix frontend
```

2. Start MySQL with Docker:

```bash
docker compose up -d mysql
```

3. Configure environment variables:

- Copy backend/.env.example to backend/.env.
- Adjust credentials if you changed docker-compose.yml.
- Optional flags:
  - DB_AUTO_MIGRATE=true
  - DB_AUTO_SEED=true

4. Run migrations and seeders (if auto-setup is disabled):

```bash
cd backend
npm run migrate
npm run seed
```

5. Start backend:

```bash
npm start
```

API available at http://localhost:4000.

6. Start frontend:

```bash
cd ../frontend
npm run dev
```

App available at http://localhost:5173.

## Available scripts

### Backend (backend folder)

- npm start: starts the API server.
- npm test: runs Jest tests.
- npm run migrate: applies migrations.
- npm run migrate:down: rolls back migrations.
- npm run seed: runs seeders.

Note: this project does not define npm run dev in backend.

### Frontend (frontend folder)

- npm run dev: starts Vite development server.
- npm run build: builds for production.
- npm run preview: previews the production build.
- npm run lint: runs ESLint.

## REST API

Base URL: http://localhost:4000

Health check:
- GET /health

### Pokemon

- GET /api/pokemon
- GET /api/pokemon/:nationalDex
- POST /api/pokemon
- PUT /api/pokemon/:nationalDex
- DELETE /api/pokemon/:nationalDex

GET /api/pokemon query filters:
- search
- type
- types[]
- limit
- offset

Example POST/PUT Pokemon body:

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

### Trainers

- GET /api/trainers
- POST /api/trainers
- PUT /api/trainers/:id
- DELETE /api/trainers/:id

Example POST/PUT Trainer body:

```json
{
  "name": "Misty",
  "hometown": "Cerulean City",
  "badgeCount": 4,
  "bio": "Water specialist",
  "portraitUrl": "/trainers/misty.png"
}
```

### Types

- GET /api/types
- POST /api/types
- PUT /api/types/:id
- DELETE /api/types/:id

Example POST/PUT Type body:

```json
{
  "name": "fire",
  "color": "#EE8130",
  "description": "Specializes in offense"
}
```

### Team

- GET /api/team
- POST /api/team
- PUT /api/team/:id
- DELETE /api/team/:id

Team business rules:
- Maximum of 6 members.
- nationalDex is required and must be between 1 and 151.
- The Pokemon must exist in the local Pokedex.

Example POST/PUT Team member body:

```json
{
  "nationalDex": 25,
  "nickname": "Sparky",
  "role": "sweeper",
  "notes": "Lead with Thunderbolt"
}
```

### Response format

- Success with payload: { "data": ... }
- Error: { "message": "..." }
- Successful DELETE: HTTP 204 with no body

## Tests

Automated CRUD tests exist for Types in backend/tests/types.crud.test.js.

Run:

```bash
cd backend
npm test
```

## Diagrams in README

### Use cases

```mermaid
flowchart LR
      User[Web User]
      Admin[Backend Operator]
      PokeApi[PokeAPI]

      UC_LIST[Browse Pokedex]
      UC_FILTER[Filter Pokemon]
      UC_DETAIL[View Pokemon details]
      UC_TYPES[Manage Types CRUD]
      UC_TRAINERS[Manage Trainers CRUD]
      UC_TEAM[Manage Team CRUD max 6]
      UC_HEALTH[Check API health]
      UC_BOOT[Initialize database]
      UC_MIG[Run migrations]
      UC_SEED[Run seeders]
      UC_IMPORT[Import Gen I Pokemon]

      User --> UC_LIST
      User --> UC_FILTER
      User --> UC_DETAIL
      User --> UC_TYPES
      User --> UC_TRAINERS
      User --> UC_TEAM
      User --> UC_HEALTH

      Admin --> UC_BOOT
      UC_BOOT --> UC_MIG
      UC_BOOT --> UC_SEED
      UC_SEED --> UC_IMPORT
      PokeApi --> UC_IMPORT
```

### Backend class architecture

```mermaid
classDiagram
      class PokemonController {
            +listPokemon(req, res, next)
            +getPokemon(req, res, next)
            +createPokemon(req, res, next)
            +updatePokemon(req, res, next)
            +deletePokemon(req, res, next)
      }

      class TrainerController {
            +listTrainers(req, res, next)
            +createTrainer(req, res, next)
            +updateTrainer(req, res, next)
            +deleteTrainer(req, res, next)
      }

      class TypeController {
            +listTypes(req, res, next)
            +createType(req, res, next)
            +updateType(req, res, next)
            +deleteType(req, res, next)
      }

      class TeamController {
            +listTeam(req, res, next)
            +createMember(req, res, next)
            +updateMember(req, res, next)
            +deleteMember(req, res, next)
      }

      class PokemonService {
            +listPokemon(filters)
            +getPokemonByNationalDex(nationalDex)
            +createPokemon(payload)
            +updatePokemon(nationalDex, payload)
            +deletePokemon(nationalDex)
      }

      class TrainerService {
            +listTrainers()
            +createTrainer(payload)
            +updateTrainer(id, payload)
            +deleteTrainer(id)
      }

      class TypeService {
            +listTypes()
            +createType(payload)
            +updateType(id, payload)
            +deleteType(id)
      }

      class TeamService {
            +listTeam()
            +addMember(payload)
            +updateMember(id, payload)
            +removeMember(id)
      }

      class PokemonModel {
            +findAll(filters)
            +findByNationalDex(nationalDex)
            +create(pokemon)
            +updateByNationalDex(nationalDex, pokemon)
            +removeByNationalDex(nationalDex)
      }

      class TrainerModel {
            +findAll()
            +findById(id)
            +create(payload)
            +update(id, payload)
            +remove(id)
      }

      class TypeModel {
            +findAll()
            +findById(id)
            +create(payload)
            +update(id, payload)
            +remove(id)
      }

      class TeamMemberModel {
            +findAll()
            +findById(id)
            +countAll()
            +create(member)
            +update(id, member)
            +remove(id)
      }

      class MySqlPool {
            +query(sql, params)
            +execute(sql, params)
      }

      PokemonController --> PokemonService
      TrainerController --> TrainerService
      TypeController --> TypeService
      TeamController --> TeamService

      PokemonService --> PokemonModel
      TrainerService --> TrainerModel
      TypeService --> TypeModel
      TeamService --> TeamMemberModel
      TeamService --> PokemonModel

      PokemonModel --> MySqlPool
      TrainerModel --> MySqlPool
      TypeModel --> MySqlPool
      TeamMemberModel --> MySqlPool
```

### Entity relationship (MySQL)

```mermaid
erDiagram
      TYPES {
            int id PK
            string name
            string color
            string description
      }

      TRAINERS {
            int id PK
            string name
            string hometown
            int badge_count
            string bio
            string portrait_url
      }

      POKEMON {
            int id PK
            int national_dex
            string name
            int height
            int weight
            int base_experience
            string sprite_url
            string types_json
            string abilities_json
            string stats_json
            int trainer_id FK
      }

      TEAM_MEMBERS {
            int id PK
            int national_dex FK
            string nickname
            string role
            string notes
      }

      TRAINERS ||--o{ POKEMON : has
      POKEMON ||--o{ TEAM_MEMBERS : contains
```

## Project structure

```text
backend/              Express API, models, services, migrations, and seeders
frontend/             React app with Vite
docs/                 Additional documentation
docker-compose.yml    Local MySQL with Docker
```

## Additional documentation

- docs/casos-de-uso.md
- docs/clases.md
- docs/entidad-relacion.md
- docs/diagrams.md
