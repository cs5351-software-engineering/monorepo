docker run `
    --detach `
    --env MINIO_ROOT_PASSWORD=admin1234 `
    --env MINIO_ROOT_USER=admin `
    --name local-minio `
    --publish 7000:9000 `
    --publish 7001:9001 `
    --rm `
    --volume minio_data:/data `
    quay.io/minio/minio server /data --console-address ":9001"
