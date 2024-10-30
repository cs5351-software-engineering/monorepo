
& ./backend_postgres/start.ps1
& ./minio/start.ps1
& ./sonarqube/up.ps1
& ./ollama/up.ps1

cursor ./frontend/workspace/nextjs
cursor ./backend/workspace/nestjs
