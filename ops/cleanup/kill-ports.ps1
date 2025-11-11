# Purpose: Free common dev ports safely on Windows
param(
  [int[]]$Ports = @(3000, 8000)
)

function Kill-Port {
  param([int]$Port)
  $lines = netstat -ano | Select-String ":$Port\s+.*LISTENING"
  if ($lines) {
    $pids = ($lines -replace '.*\s(\d+)$','$1') | Sort-Object -Unique
    foreach ($pid in $pids) {
      try { Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue } catch {}
      Start-Sleep -Milliseconds 200
    }
    Write-Output "Killed PIDs on :$Port -> $($pids -join ',')"
  } else {
    Write-Output "No listeners on :$Port"
  }
}

foreach ($p in $Ports) {
  Kill-Port -Port $p
}

Write-Output "Ports freed."
