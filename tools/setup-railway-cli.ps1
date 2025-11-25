param(
    [string]$RailwayToken
)

if (-not $RailwayToken) {
    Write-Host "Error: Provide Railway token via -RailwayToken." -ForegroundColor Red
    exit 1
}

Write-Host "Installing Railway CLI globally..."
npm install -g @railway/cli | Out-Null

$envPath = [Environment]::GetEnvironmentVariable('Path','User')
if ($envPath -notlike '*AppData\\Roaming\\npm*') {
    [Environment]::SetEnvironmentVariable('Path',"$envPath;C:\\Users\\$env:USERNAME\\AppData\\Roaming\\npm",'User')
    Write-Host "Added npm global bin to PATH. Restart terminal to use." -ForegroundColor Yellow
}

$projectRoot = "C:/Users/$env:USERNAME/Desktop/DevOps/1. Projects/Icebreaker"
if (-not (Test-Path $projectRoot)) {
    Write-Host "Project folder not found at $projectRoot" -ForegroundColor Red
    exit 1
}

$env:RAILWAY_TOKEN = $RailwayToken
Set-Item -Path Env:RAILWAY_TOKEN -Value $RailwayToken

Write-Host "Logging in via token..."
railway login --browserless | Out-Null

Write-Host "Linking project..."
Set-Location $projectRoot
railway link | Out-Null

if (-not (Test-Path ".railway")) {
    Write-Host "Failed to link project." -ForegroundColor Red
    exit 1
}

Write-Host "Railway CLI setup complete." -ForegroundColor Green
