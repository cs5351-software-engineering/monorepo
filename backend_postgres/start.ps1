docker container run `
    --detach `
    --env POSTGRES_DB=code-analysis `
    --env POSTGRES_PASSWORD=admin `
    --name local-postgres `
    --publish 5432:5432 `
    --rm `
    postgres:15
