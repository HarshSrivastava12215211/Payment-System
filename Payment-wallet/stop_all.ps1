# Aggressive Stop Script v2
$ports = @(8761, 7512, 7500, 7501, 7502, 7503, 7504, 7505, 7506, 7507, 7511)

foreach ($port in $ports) {
    Write-Host "Checking port $port..." -ForegroundColor Cyan
    $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($connections) {
        foreach ($conn in $connections) {
            $pId = $conn.OwningProcess
            if ($pId -gt 100) { # Avoid system processes
                Write-Host "Killing process $pId on port $port" -ForegroundColor Yellow
                Stop-Process -Id $pId -Force -ErrorAction SilentlyContinue
            }
        }
    }
}

# Also kill any leftover mvnw processes
Get-Process -Name "java" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Write-Host "All Java processes and ports cleared." -ForegroundColor Green
