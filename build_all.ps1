# Clear the console
Clear-Host

# Store the current directory in a variable
$currentDir = Get-Location

# Function to build develop and release images
function BuildDevelopReleaseImage {
    param (
        [string]$folder_name
    )

    # Set the working directory
    Set-Location $currentDir\$folder_name\

    # Build develop image
    Write-Host "`n[$folder_name] Building develop image ..." -ForegroundColor Blue
    & .\build.develop.ps1
    
    # Check if the develop image was built successfully
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[$folder_name] Develop image built successfully." -ForegroundColor Green
    } else {
        Write-Host "[$folder_name] Failed to build develop image." -ForegroundColor Red
        exit 1
    }

    # Build release image
    Write-Host "`n[$folder_name] Building release image ..." -ForegroundColor Blue
    & .\build.release.ps1

    # Check if the release image was built successfully
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[$folder_name] Release image built successfully." -ForegroundColor Green
    } else {
        Write-Host "[$folder_name] Failed to build release image." -ForegroundColor Red
        exit 1
    }

}

# try-catch-finally can handle ctrl+c and return to the original directory
try {
    # Build develop and release images for frontend, backend, and ollama
    BuildDevelopReleaseImage frontend
    BuildDevelopReleaseImage backend
    BuildDevelopReleaseImage ollama

} finally {
    # Return to the original directory
    Set-Location $currentDir
}
