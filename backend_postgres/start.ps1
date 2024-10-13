docker container run `
    --detach `
    --env POSTGRES_DB=code-analysis `
    --env POSTGRES_PASSWORD=admin `
    --name local-postgres `
    --publish 5432:5432 `
    --rm `
    --volume nestjs_database_data:/var/lib/postgresql/data `
    postgres:15
