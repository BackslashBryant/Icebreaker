# E2E Test Runner Script
# This script starts servers if needed and runs Playwright tests

Write-Host "Checking if servers are running..." -ForegroundColor Cyan

# Check backend
try {
    $backendResponse = Invoke-WebRequest -Uri "http://localhost:8000/api/health" -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
    Write-Host "✓ Backend is running on port 8000" -ForegroundColor Green
} catch {
    Write-Host "✗ Backend not running. Starting backend..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\..\backend'; npm run dev" -WindowStyle Minimized
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
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\..\frontend'; npm run dev" -WindowStyle Minimized
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
npm --prefix "$PSScriptRoot" test
