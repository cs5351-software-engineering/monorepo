docker container run `
    --name pgadmin-container `
    -p 5050:80 `
    -e PGADMIN_DEFAULT_EMAIL=admin@admin.com `
    -e PGADMIN_DEFAULT_PASSWORD=admin `
    -d dpage/pgadmin4
