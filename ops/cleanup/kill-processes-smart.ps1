# Purpose: Smart process cleanup - identifies and kills only project-related processes
# Excludes MCP processes and Cursor IDE processes
param(
    [switch]$DryRun = $false
)

$ErrorActionPreference = "Continue"

# Get project root directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Split-Path -Parent (Split-Path -Parent $scriptPath) # Go up from ops/cleanup/ to repo root
$projectPath = $repoRoot.Replace('\', '\\') # Escape for regex

Write-Host "Smart Process Cleanup - Project: $repoRoot" -ForegroundColor Cyan
Write-Host "Excluding: MCP processes, Cursor IDE processes" -ForegroundColor Yellow
Write-Host ""

# Identify project-related processes
# Match patterns: icebreaker (project name), vite (frontend dev server), playwright test-server, node dev with project path
# Exclude: mcp, @playwright/mcp, mcp-server-playwright, Cursor.exe
$processes = Get-WmiObject Win32_Process | Where-Object {
    $cmd = $_.CommandLine
    if (-not $cmd) { return $false }
    
    # Project process patterns
    $isProjectProcess = (
        $cmd -match "icebreaker" -or
        $cmd -match "vite" -or
        $cmd -match "playwright.*test-server" -or
        ($cmd -match "node.*dev" -and $cmd -match $projectPath) -or
        ($cmd -match "esbuild" -and $cmd -match $projectPath)
    )
    
    # Exclude patterns (MCP and Cursor)
    $isExcluded = (
        $cmd -match "mcp" -or
        $cmd -match "@playwright/mcp" -or
        $cmd -match "mcp-server-playwright" -or
        $cmd -match "Cursor\.exe"
    )
    
    return ($isProjectProcess -and -not $isExcluded)
}

if ($null -eq $processes -or $processes.Count -eq 0) {
    Write-Host "No project-related processes found to kill." -ForegroundColor Green
    exit 0
}

Write-Host "Found $($processes.Count) project-related process(es):" -ForegroundColor Cyan
$processes | ForEach-Object {
    $cmdPreview = if ($_.CommandLine) { $_.CommandLine.Substring(0, [Math]::Min(80, $_.CommandLine.Length)) } else { "N/A" }
    Write-Host "  PID $($_.ProcessId): $cmdPreview" -ForegroundColor Gray
}

if ($DryRun) {
    Write-Host ""
    Write-Host "[DRY RUN] Would kill $($processes.Count) process(es)." -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "Killing processes..." -ForegroundColor Yellow
$killed = 0
$processes | ForEach-Object {
    try {
        Stop-Process -Id $_.ProcessId -Force -ErrorAction Stop
        Write-Host "  Killed PID $($_.ProcessId)" -ForegroundColor Green
        $killed++
    }
    catch {
        Write-Host "  Failed to kill PID $($_.ProcessId): $_" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Killed $killed of $($processes.Count) process(es)." -ForegroundColor Green

# Verify ports are free
Write-Host ""
Write-Host "Verifying ports..." -ForegroundColor Cyan
$ports = @(3000, 8000)
foreach ($port in $ports) {
    $listeners = netstat -ano | Select-String ":$port\s+.*LISTENING"
    if ($listeners) {
        Write-Host "  Port $port still has listeners" -ForegroundColor Yellow
    }
    else {
        Write-Host "  Port $port is free" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "Cleanup complete." -ForegroundColor Green
