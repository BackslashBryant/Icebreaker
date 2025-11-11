#!/usr/bin/env pwsh
# Sync GITHUB_TOKEN environment variable with GitHub CLI's keyring token
# This ensures git operations and MCP servers use the same token

$ErrorActionPreference = "Stop"

Write-Host "Syncing GITHUB_TOKEN with GitHub CLI token..." -ForegroundColor Cyan

# Get token from GitHub CLI
try {
    $ghToken = gh auth token 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error: GitHub CLI not authenticated. Run 'gh auth login' first." -ForegroundColor Red
        exit 1
    }
    
    if (-not $ghToken -or $ghToken.Trim() -eq '') {
        Write-Host "Error: GitHub CLI returned empty token." -ForegroundColor Red
        exit 1
    }
    
    # Set as User-level environment variable (persistent)
    [System.Environment]::SetEnvironmentVariable('GITHUB_TOKEN', $ghToken.Trim(), 'User')
    
    Write-Host "  [OK] GITHUB_TOKEN synced with GitHub CLI token" -ForegroundColor Green
    Write-Host ""
    Write-Host "[SUCCESS] Token synchronized." -ForegroundColor Green
    Write-Host ""
    Write-Host "[NOTE] Restart Cursor for MCP servers to pick up the new token." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Git operations will use GitHub CLI's credential helper." -ForegroundColor Cyan
    Write-Host "MCP servers will use the GITHUB_TOKEN environment variable." -ForegroundColor Cyan
    
} catch {
    Write-Host "Error: Failed to sync token - $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

