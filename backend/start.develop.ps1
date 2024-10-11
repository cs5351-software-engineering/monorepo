docker container run `
    --detach `
    --hostname "backend-develop-container" `
    --interactive `
    --name "backend-develop-container" `
    --rm `
    --stop-timeout 0 `
    --tty `
    --volume "$PWD/workspace/:/workspace/" `
    backend-develop-image

if (Get-Command "cursor" -errorAction SilentlyContinue)
{
    cursor --folder-uri vscode-remote://attached-container+6261636b656e642d646576656c6f702d636f6e7461696e6572/workspace
}
elseif (Get-Command "code" -errorAction SilentlyContinue)
{
    code --folder-uri vscode-remote://attached-container+6261636b656e642d646576656c6f702d636f6e7461696e6572/workspace
}

