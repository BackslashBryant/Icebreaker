# PowerShell script to run E2E tests with proper encoding
# Sets UTF-8 encoding to prevent Unicode character artifacts in output
# Works from any directory - detects project root automatically

# Set UTF-8 encoding for PowerShell output
$OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::InputEncoding = [System.Text.Encoding]::UTF8

# Set code page to UTF-8 (65001)
chcp 65001 | Out-Null

Write-Host "Running E2E tests with UTF-8 encoding..." -ForegroundColor Cyan
Write-Host ""

# Detect project root (look for .git or package.json)
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = $scriptPath

# If script is in tests/, go up one level
if (Split-Path -Leaf $repoRoot -eq "tests") {
    $repoRoot = Split-Path -Parent $repoRoot
}

# Verify we're in the right place
if (-not (Test-Path (Join-Path $repoRoot "package.json"))) {
    Write-Host "Error: Could not find project root. Looking for package.json" -ForegroundColor Red
    Write-Host "Current directory: $PWD" -ForegroundColor Yellow
    Write-Host "Script path: $scriptPath" -ForegroundColor Yellow
    exit 1
}

# Change to tests directory (works whether script is in root or tests/)
$testsDir = Join-Path $repoRoot "tests"
if (-not (Test-Path $testsDir)) {
    Write-Host "Error: tests directory not found at $testsDir" -ForegroundColor Red
    exit 1
}

Push-Location $testsDir

try {
    # Check if servers are running
    Write-Host "Checking server status..." -ForegroundColor Cyan
    
    # Check backend
    try {
        $backendResponse = Invoke-WebRequest -Uri "http://localhost:8000/api/health" -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
        Write-Host "✓ Backend is running on port 8000" -ForegroundColor Green
    } catch {
        Write-Host "✗ Backend not running. Starting backend..." -ForegroundColor Yellow
        $backendPath = Join-Path $repoRoot "backend"
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; npm run dev:e2e" -WindowStyle Minimized
        Start-Sleep -Seconds 5
        Write-Host "Waiting for backend to be ready..." -ForegroundColor Cyan
        $maxAttempts = 30
        $attempt = 0
        while ($attempt -lt $maxAttempts) {
            try {
                $response = Invoke-WebRequest -Uri "http://localhost:8000/api/health" -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
                Write-Host "✓ Backend is ready!" -ForegroundColor Green
                break
            } catch {
                $attempt++
                Start-Sleep -Seconds 1
            }
        }
    }
    
    # Check frontend
    try {
        $frontendResponse = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
        Write-Host "✓ Frontend is running on port 3000" -ForegroundColor Green
    } catch {
        Write-Host "✗ Frontend not running. Starting frontend..." -ForegroundColor Yellow
        $frontendPath = Join-Path $repoRoot "frontend"
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; npm run dev" -WindowStyle Minimized
        Start-Sleep -Seconds 5
        Write-Host "Waiting for frontend to be ready..." -ForegroundColor Cyan
        $maxAttempts = 30
        $attempt = 0
        while ($attempt -lt $maxAttempts) {
            try {
                $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
                Write-Host "✓ Frontend is ready!" -ForegroundColor Green
                break
            } catch {
                $attempt++
                Start-Sleep -Seconds 1
            }
        }
    }

    Write-Host "`nRunning Playwright tests..." -ForegroundColor Cyan
    Write-Host ""
    
    # Run tests (NO_COLOR handled by Playwright config)
    npm test
    
    $exitCode = $LASTEXITCODE
    if ($exitCode -eq 0) {
        Write-Host "`n✓ All tests passed!" -ForegroundColor Green
    } else {
        Write-Host "`n✗ Some tests failed (exit code: $exitCode)" -ForegroundColor Red
    }
    
    exit $exitCode
} finally {
    Pop-Location
}
