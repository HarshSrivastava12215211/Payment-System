# Full Microservices Cluster Recovery Script v4
# Corrected Ports and Background Logging

$basePath = "C:\Users\Asus\Desktop\Payment-wallet"

function Test-Port($port) {
    return Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
}

# 1. Eureka-Server (8761)
if (-not (Test-Port 8761)) {
    Write-Host "Starting Eureka-Server (8761)..." -ForegroundColor Cyan
    Start-Process powershell -WindowStyle Hidden -ArgumentList "-Command", "cd '$basePath\Eureka-Server'; mvnw.cmd spring-boot:run > eureka_server_bg.log 2>&1"
    Write-Host "Waiting for Eureka (40s)..."
    Start-Sleep -Seconds 40
}

# 2. Config-Servier (7512)
if (-not (Test-Port 7512)) {
    Write-Host "Starting Config-Servier (7512)..." -ForegroundColor Cyan
    Start-Process powershell -WindowStyle Hidden -ArgumentList "-Command", "cd '$basePath\Config-Servier'; mvnw.cmd spring-boot:run > config_server_bg.log 2>&1"
    Write-Host "Waiting for Config Server (30s)..."
    Start-Sleep -Seconds 30
}

# 3. All Other Services
$services = @(
    @{ name = "User-Service"; port = 7500 },
    @{ name = "Admin-Service"; port = 7501 },
    @{ name = "KYC-Services"; port = 7502 },
    @{ name = "Wallet-Service"; port = 7503 },
    @{ name = "Payment-Services"; port = 7504 },
    @{ name = "Api-Gateway"; port = 7505 },
    @{ name = "Transaction-Service"; port = 7506 },
    @{ name = "Notification-Service"; port = 7507 },
    @{ name = "Rewards-Service"; port = 7511 }
)

foreach ($svc in $services) {
    if (-not (Test-Port $svc.port)) {
        Write-Host "Starting $($svc.name) on port $($svc.port)..." -ForegroundColor Cyan
        $logFile = "$($svc.name.ToLower().Replace('-', '_'))_bg.log"
        Start-Process powershell -WindowStyle Hidden -ArgumentList "-Command", "cd '$basePath\$($svc.name)'; mvnw.cmd spring-boot:run > $logFile 2>&1"
        Start-Sleep -Seconds 5
    } else {
        Write-Host "$($svc.name) is already running on port $($svc.port)." -ForegroundColor Green
    }
}

Write-Host "All services triggered. Checking status in 30 seconds..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

foreach ($svc in $services) {
    if (Test-Port $svc.port) {
        Write-Host "[UP] $($svc.name) (port $($svc.port))" -ForegroundColor Green
    } else {
        Write-Host "[FAILED/STARTING] $($svc.name) (port $($svc.port))" -ForegroundColor Red
    }
}
