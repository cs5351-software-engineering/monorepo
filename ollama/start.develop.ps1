docker container run `
    --detach `
    --hostname "ollama-develop-container" `
    --interactive `
    --name "ollama-develop-container" `
    --rm `
    --stop-timeout 0 `
    --tty `
    --volume "$PWD/workspace/:/workspace/" `
    ollama-develop-image

if (Get-Command "cursor" -errorAction SilentlyContinue)
{
    cursor --folder-uri vscode-remote://attached-container+6f6c6c616d612d646576656c6f702d636f6e7461696e6572/workspace
}
elseif (Get-Command "code" -errorAction SilentlyContinue)
{
    code --folder-uri vscode-remote://attached-container+6f6c6c616d612d646576656c6f702d636f6e7461696e6572/workspace
}

