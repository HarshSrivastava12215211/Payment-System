# Full Microservices Cluster Recovery Script v3
$basePath = "C:\Users\Asus\Desktop\Payment-wallet"

# Function to check if a port is listening
function Test-Port($port) {
    return Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
}

# 1. Eureka-Server (8761) - MUST BE FIRST
if (-not (Test-Port 8761)) {
    Write-Host "Starting Eureka-Server (8761)..." -ForegroundColor Cyan
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$basePath\Eureka-Server'; mvn spring-boot:run"
    Start-Sleep -Seconds 40
}

# 2. Config-Servier (7505) - SHOULD BE SECOND
if (-not (Test-Port 7505)) {
    Write-Host "Starting Config-Servier (7505)..." -ForegroundColor Cyan
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$basePath\Config-Servier'; mvn spring-boot:run"
    Start-Sleep -Seconds 30
}

# 3. All Other Services
$services = @(
    @{ name = "User-Service"; port = 7500 },
    @{ name = "KYC-Services"; port = 7501 },
    @{ name = "Admin-Service"; port = 7502 },
    @{ name = "Wallet-Service"; port = 7507 },
    @{ name = "Payment-Services"; port = 7508 },
    @{ name = "Transaction-Service"; port = 7509 },
    @{ name = "Api-Gateway"; port = 7510 },
    @{ name = "Rewards-Service"; port = 7511 },
    @{ name = "Notification-Service"; port = 7512 }
)

foreach ($svc in $services) {
    if (-not (Test-Port $svc.port)) {
        Write-Host "Starting $($svc.name) on port $($svc.port)..." -ForegroundColor Cyan
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$basePath\$($svc.name)'; mvn spring-boot:run"
        Start-Sleep -Seconds 12
    } else {
        Write-Host "$($svc.name) is already running on port $($svc.port)." -ForegroundColor Green
    }
}

Write-Host "Total Cluster Recovery Triggered." -ForegroundColor Yellow
