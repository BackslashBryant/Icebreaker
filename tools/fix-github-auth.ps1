#!/usr/bin/env pwsh
# Fix GitHub CLI authentication issues
# Removes conflicting GITHUB_TOKEN env vars and refreshes GitHub CLI auth

$ErrorActionPreference = "Continue"

Write-Host "Fixing GitHub CLI authentication..." -ForegroundColor Cyan
Write-Host ""

# Step 1: Clear GITHUB_TOKEN from all locations
Write-Host "[1/5] Clearing GITHUB_TOKEN environment variables..." -ForegroundColor Yellow

# Clear from current session
$env:GITHUB_TOKEN = $null
Remove-Item Env:\GITHUB_TOKEN -ErrorAction SilentlyContinue
Write-Host "  [OK] Cleared process-level GITHUB_TOKEN" -ForegroundColor Green

# Clear from User-level
$userToken = [System.Environment]::GetEnvironmentVariable('GITHUB_TOKEN', 'User')
if ($userToken) {
    [System.Environment]::SetEnvironmentVariable('GITHUB_TOKEN', $null, 'User')
    Write-Host "  [OK] Cleared User-level GITHUB_TOKEN" -ForegroundColor Green
}
else {
    Write-Host "  [OK] No User-level GITHUB_TOKEN found" -ForegroundColor Green
}

# Remove from .env file if it exists
$repoRoot = if ($PSScriptRoot) { Split-Path -Parent $PSScriptRoot } else { $PWD }
$envFile = Join-Path $repoRoot ".env"
if (Test-Path $envFile) {
    $envContent = Get-Content $envFile -Raw
    if ($envContent -match 'GITHUB_TOKEN=') {
        $lines = Get-Content $envFile
        $newLines = $lines | Where-Object { $_ -notmatch '^\s*GITHUB_TOKEN\s*=' }
        Set-Content -Path $envFile -Value ($newLines -join "`r`n")
        Write-Host "  [OK] Removed GITHUB_TOKEN from .env file" -ForegroundColor Green
    }
    else {
        Write-Host "  [OK] No GITHUB_TOKEN in .env file" -ForegroundColor Green
    }
}
else {
    Write-Host "  [OK] No .env file found" -ForegroundColor Green
}

# Step 2: Force logout (ignore errors if already logged out)
Write-Host ""
Write-Host "[2/5] Logging out from GitHub CLI..." -ForegroundColor Yellow
$env:GITHUB_TOKEN = $null
$logoutOutput = gh auth logout 2>&1 | Out-String
if ($LASTEXITCODE -eq 0) {
    Write-Host "  [OK] Logged out" -ForegroundColor Green
}
else {
    Write-Host "  [OK] Already logged out or logout not needed" -ForegroundColor Green
}

# Step 3: Wait a moment for cleanup
Start-Sleep -Seconds 1

# Step 4: Login to GitHub CLI (force fresh login)
Write-Host ""
Write-Host "[3/5] Logging in to GitHub CLI..." -ForegroundColor Yellow
Write-Host "  You'll need to authenticate via browser" -ForegroundColor Cyan
Write-Host "  Follow the prompts..." -ForegroundColor Cyan
Write-Host ""

# Use device flow for more reliable authentication
gh auth login --hostname github.com --scopes repo --web

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "[ERROR] Authentication failed. Exit code: $LASTEXITCODE" -ForegroundColor Red
    Write-Host "Try running manually: gh auth login --hostname github.com --scopes repo --web" -ForegroundColor Yellow
    exit 1
}

# Step 5: Verify authentication
Write-Host ""
Write-Host "[4/5] Verifying authentication..." -ForegroundColor Yellow
$authStatus = gh auth status 2>&1 | Out-String
if ($authStatus -match 'Logged in' -or $authStatus -match 'OK') {
    Write-Host "  [OK] GitHub CLI authenticated successfully" -ForegroundColor Green
    
    # Test API access with REST API (more reliable than GraphQL)
    Write-Host ""
    Write-Host "[5/5] Testing API access..." -ForegroundColor Yellow
    $token = gh auth token 2>&1
    if ($LASTEXITCODE -eq 0 -and $token) {
        $headers = @{
            Authorization = "Bearer $token"
            Accept = "application/vnd.github.v3+json"
        }
        try {
            $testUrl = "https://api.github.com/repos/BackslashBryant/Icebreaker/issues?state=open&per_page=1"
            $testResult = Invoke-RestMethod -Uri $testUrl -Method Get -Headers $headers -ErrorAction Stop
            Write-Host "  [OK] API access working (REST API)" -ForegroundColor Green
            
            # Also test GraphQL
            $graphqlTest = gh issue list --limit 1 --json number 2>&1 | Out-String
            if ($LASTEXITCODE -eq 0) {
                Write-Host "  [OK] GraphQL API access working" -ForegroundColor Green
            }
            else {
                Write-Host "  [WARN] GraphQL API test failed (REST API works, which is fine)" -ForegroundColor Yellow
            }
            
            Write-Host ""
            Write-Host "[SUCCESS] GitHub CLI authentication fixed and verified!" -ForegroundColor Green
        }
        catch {
            Write-Host "  [ERROR] API access test failed: $_" -ForegroundColor Red
            Write-Host "  Token retrieved but API call failed - token may be expired" -ForegroundColor Yellow
            Write-Host "  Try: gh auth refresh -s repo -h github.com" -ForegroundColor Yellow
            exit 1
        }
    }
    else {
        Write-Host "  [ERROR] Could not retrieve token: $token" -ForegroundColor Red
        exit 1
    }
}
else {
    Write-Host "  [ERROR] Authentication verification failed" -ForegroundColor Red
    Write-Host "  Output: $authStatus" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "[IMPORTANT] To prevent this issue:" -ForegroundColor Cyan
Write-Host "  - Do NOT set GITHUB_TOKEN as a persistent environment variable" -ForegroundColor White
Write-Host "  - Do NOT add GITHUB_TOKEN to .env file" -ForegroundColor White
Write-Host "  - GitHub CLI uses keyring for authentication" -ForegroundColor White
Write-Host "  - MCP servers should call 'gh auth token' when they need a token" -ForegroundColor White
