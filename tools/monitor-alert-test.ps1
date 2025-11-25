#!/usr/bin/env pwsh
# Alert Test Monitoring Script
# Checks health endpoint and UptimeRobot status every 60 seconds

param(
    [int]$IntervalSeconds = 60,
    [int]$MaxChecks = 20  # Stop after 20 checks (~20 minutes)
)

$monitorKey = "m801829620-3594eb47c661420e347dae32"
$healthUrl = "https://airy-fascination-production.up.railway.app/api/health"
$checkCount = 0

Write-Host "`n=== Alert Test Monitoring Started ===" -ForegroundColor Cyan
Write-Host "Health Endpoint: $healthUrl"
Write-Host "Monitor Key: $monitorKey"
Write-Host "Check Interval: $IntervalSeconds seconds"
Write-Host "Max Checks: $MaxChecks"
Write-Host "`nStarting monitoring loop...`n" -ForegroundColor Green

while ($checkCount -lt $MaxChecks) {
    $checkCount++
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    
    Write-Host "[$timestamp] Check #$checkCount" -ForegroundColor Yellow
    Write-Host "-" * 60
    
    # Check health endpoint
    try {
        $response = Invoke-WebRequest -Uri $healthUrl -UseBasicParsing -ErrorAction Stop
        $statusCode = $response.StatusCode
        $content = $response.Content | ConvertFrom-Json
        
        if ($statusCode -eq 500) {
            Write-Host "✅ Health Endpoint: 500 (FAILING - Test flag active)" -ForegroundColor Red
            Write-Host "   Response: $($content | ConvertTo-Json -Compress)"
        } else {
            Write-Host "⚠️  Health Endpoint: $statusCode (Still OK - Deploy may not be complete)" -ForegroundColor Yellow
            Write-Host "   Response: $($content | ConvertTo-Json -Compress)"
        }
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        if ($statusCode -eq 500) {
            Write-Host "✅ Health Endpoint: 500 (FAILING - Test flag active)" -ForegroundColor Red
        } else {
            Write-Host "❌ Health Endpoint: Error - $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    
    # Check UptimeRobot status
    try {
        $uptimeOutput = node tools/uptimerobot-config.mjs --action=get --monitor-key=$monitorKey 2>&1
        if ($LASTEXITCODE -eq 0) {
            if ($uptimeOutput -match "Status: (Up|Down|Paused)") {
                $status = $Matches[1]
                if ($status -eq "Down") {
                    Write-Host "✅ UptimeRobot: DOWN (Detecting failure)" -ForegroundColor Red
                } else {
                    Write-Host "⚠️  UptimeRobot: $status" -ForegroundColor Yellow
                }
            } else {
                Write-Host "ℹ️  UptimeRobot: Status check completed" -ForegroundColor Cyan
            }
        } else {
            Write-Host "⚠️  UptimeRobot: Check failed" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "⚠️  UptimeRobot: Error - $($_.Exception.Message)" -ForegroundColor Yellow
    }
    
    Write-Host ""
    
    # Wait before next check (unless last check)
    if ($checkCount -lt $MaxChecks) {
        Write-Host "Waiting $IntervalSeconds seconds until next check...`n" -ForegroundColor Gray
        Start-Sleep -Seconds $IntervalSeconds
    }
}

Write-Host "`n=== Monitoring Complete ===" -ForegroundColor Cyan
Write-Host "Total checks: $checkCount"
Write-Host "`nNext steps:"
Write-Host "- Check email (backslashbryant@gmail.com) for alert"
Write-Host "- Verify UptimeRobot detected 3 consecutive failures"
Write-Host "- Remove HEALTH_CHECK_TEST_FAIL env var to test recovery"

