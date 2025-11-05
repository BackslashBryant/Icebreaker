#!/usr/bin/env pwsh
# PowerShell script to load .env file values into system environment variables
# This allows Cursor MCP servers to access values stored in .env files

param(
    [string]$EnvFile = ".env"
)

$ErrorActionPreference = "Stop"

# Get the repo root
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Split-Path -Parent $scriptPath
$envPath = Join-Path $repoRoot $EnvFile

Write-Host "Loading environment variables from .env file..." -ForegroundColor Cyan

if (-not (Test-Path $envPath)) {
    Write-Host "Error: .env file not found at: $envPath" -ForegroundColor Red
    Write-Host "Run 'npm run setup:tokens' first to create it." -ForegroundColor Yellow
    exit 1
}

# Read .env file and parse key=value pairs
$lines = Get-Content $envPath
$varsSet = 0

foreach ($line in $lines) {
    # Skip comments and empty lines
    $trimmed = $line.Trim()
    if ($trimmed -match '^\s*#' -or $trimmed -eq '') {
        continue
    }

    # Parse KEY=VALUE format
    if ($trimmed -match '^([^=]+)=(.*)$') {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim()

        # Skip if key is empty
        if (-not $key) {
            continue
        }

        # Skip placeholder values (empty, "your-*", "placeholder", etc.)
        if (-not $value -or
            $value -match '^your-.*' -or
            $value -match '^placeholder' -i -or
            $value -match '^<.*>$' -or
            $value -eq '') {
            continue
        }

        # Remove quotes if present
        if ($value -match '^["''](.*)["'']$') {
            $value = $matches[1]
        }

        # Only set if we have a non-empty value after processing
        if ($key -and $value -and $value.Trim() -ne '') {
            # Set as user environment variable (persistent)
            [System.Environment]::SetEnvironmentVariable($key, $value, 'User')
            Write-Host "  ✓ Set $key" -ForegroundColor Green
            $varsSet++
        }
    }
}

if ($varsSet -eq 0) {
    Write-Host "Warning: No environment variables found in .env file." -ForegroundColor Yellow
} else {
    Write-Host "`n✅ Set $varsSet environment variable(s) in your user profile." -ForegroundColor Green
    Write-Host "`n⚠️  IMPORTANT: You must restart Cursor for these to take effect!" -ForegroundColor Yellow
    Write-Host "`nAfter restarting Cursor, your MCP servers should work." -ForegroundColor Cyan
}
