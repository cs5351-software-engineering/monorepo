docker run `
    --env MINIO_ROOT_PASSWORD=admin1234 `
    --env MINIO_ROOT_USER=admin `
    --publish 7000:9000 `
    --publish 7001:9001 `
    --rm `
    --detach `
    --name local-minio `
    quay.io/minio/minio server /data --console-address ":9001"
