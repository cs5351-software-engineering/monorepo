# Monorepo

## Requirement

- [Docker](https://www.docker.com/products/docker-desktop/)
- [Node.js LTS](https://nodejs.org/en/download/prebuilt-installer)
- [pnpm](https://pnpm.io/installation) `npm install -g pnpm`
- [PowerShell](https://learn.microsoft.com/en-us/powershell/scripting/install/installing-powershell) `pwsh`

## Init for local development

### Backend

Create `.env` in `./backend/workspace/nestjs`

```ini
# Oauth2
GITHUB_CLIENT_ID=xxxxx
GITHUB_CLIENT_SECRET=xxxxx
GOOGLE_CLIENT_ID=xxxxx
GOOGLE_CLIENT_SECRET=xxxxx

# JWT
JWT_SECRET=xxxxx
JWT_ACCESS_EXPIRATION=1h
JWT_REFRESH_EXPIRATION=7d

# For TypeORM
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=admin
DB_DATABASE=code-analysis

# For primas
DATABASE_URL=postgresql://postgres:admin@localhost:5432/code-analysis?schema=public

# TypeORM
TYPEORM_SYNCHRONIZE=true
TYPEORM_LOGGING=true
TYPEORM_MIGRATIONS=dist/migrations/*.js
TYPEORM_MIGRATIONS_DIR=src/migrations
```

Enter to `./backend/workspace/nestjs` folder

Start postgres container

```powershell
.\start_postgres.ps1
```

Install dependencies and start nestjs server

```bash
pnpm install
pnpm run start:dev
```

### Frontend

Enter to `./frontend/workspace/react` folder and run

```bash
pnpm install
pnpm start
```

## Docker compose

```powershell
.\build_all.ps1
.\up.release.ps1
```

