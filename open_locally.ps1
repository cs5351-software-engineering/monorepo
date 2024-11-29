
cursor ./frontend/workspace/nextjs
cursor ./backend/workspace/nestjs

& ./backend_postgres/start.ps1
& ./minio/start.ps1

Set-Location ./sonarqube
& ./up.ps1

Set-Location ../

Set-Location ./ollama
& ./up.ps1
