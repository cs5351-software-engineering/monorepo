## Project setup

```bash
pnpm install
```

```bash
pnpm run start:dev
```

## Init step

### File upload

https://docs.nestjs.com/techniques/file-upload

```bash
pnpm add --save-dev @types/multer
```

___

```
nest generate module sonarqube
nest generate service sonarqube
nest generate controller sonarqube
```

TypeORM: https://docs.nestjs.com/techniques/database

___

https://blog.logrocket.com/best-methods-unzipping-files-node-js/

```
pnpm add adm-zip
```

## SonarQube Service Analysis Status

- `Running`
- `Scanner Done`
- `Completed`

## SonarQube Scanner

https://docs.sonarsource.com/sonarqube/latest/analyzing-source-code/scanners/sonarscanner/

## Minio

### Structure

```
bucketName: `project-${projectId}`
- source_code
  - xxx.zip
- analysis
  - sonarqube
    - xxx.pdf
  - ollama
    - xxx.pdf
  - vulnerability-scanning
    - xxx.pdf
```

Detail report data in database object

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Format and lint

```bash
npm run format
```

```bash
npm run lint
```

## Primas command

```bash
npx prisma migrate dev --name init
```

```bash
npx prisma db push
```
