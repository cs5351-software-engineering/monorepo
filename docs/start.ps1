docker container run `
    --detach `
    --hostname "docusaurus-develop-container" `
    --interactive `
    --name "docusaurus-develop-container" `
    --publish 3000:3000 `
    --rm `
    --stop-timeout 0 `
    --tty `
    --volume $PWD/workspace:/workspace `
    docusaurus-develop-image
