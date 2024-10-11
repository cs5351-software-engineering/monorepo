docker container run `
    --detach `
    --env POSTGRES_DB=code-analysis `
    --env POSTGRES_PASSWORD=admin `
    --name postgres-code-analysis `
    --publish 5432:5432 `
    postgres:15
