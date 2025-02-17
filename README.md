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
# Google
GOOGLE_CLIENT_ID=xxxxx
GOOGLE_CLIENT_SECRET=xxxxx

# JWT
JWT_SECRET=xxxxx
JWT_ACCESS_EXPIRATION=1h
JWT_REFRESH_EXPIRATION=7d

# Postgres
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=admin
DB_DATABASE=code-analysis

# Prisma
DATABASE_URL=postgresql://postgres:admin@localhost:5432/code-analysis?schema=public

# TypeORM
TYPEORM_SYNCHRONIZE=true
TYPEORM_LOGGING=true
TYPEORM_MIGRATIONS=dist/migrations/*.js
TYPEORM_MIGRATIONS_DIR=src/migrations

# Ollama
OLLAMA_ENDPOINT=http://localhost:11434
OLLAMA_MODEL=qwen2.5-coder:1.5b-instruct

# MinIO
MINIO_ENDPOINT=localhost
MINIO_PORT=7000
MINIO_ACCESSKEY=XXXXX
MINIO_SECRETKEY=XXXXX

# SonarQube
SONARQUBE_URL=http://localhost:9000
SONARQUBE_TOKEN=xxxxx

# SonarQube Scanner
SONAR_SCANNER_PATH=../sonar-scanner/bin
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

## Port

| Service   | Port                      |
| --------- | ------------------------- |
| Frontend  | 3000                      |
| Backend   | 8080                      |
| Postgres  | 5432                      |
| MinIO     | 7000 (API), 7001 (Web UI) |
| SonarQube | 9000                      |
