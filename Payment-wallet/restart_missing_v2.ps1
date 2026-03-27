# Advanced Microservices Recovery Script
$basePath = "C:\Users\Asus\Desktop\Payment-wallet"

# Function to check if a port is listening
function Test-Port($port) {
    return Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
}

# 1. Config-Servier (7505) - Ensure this is up first
if (-not (Test-Port 7505)) {
    Write-Host "Starting Config-Servier (7505)..." -ForegroundColor Cyan
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$basePath\Config-Servier'; mvn spring-boot:run"
    Start-Sleep -Seconds 30
}

# 2. Others
$services = @(
    @{ name = "KYC-Services"; port = 7501 },
    @{ name = "User-Service"; port = 7500 },
    @{ name = "Admin-Service"; port = 7502 },
    @{ name = "Api-Gateway"; port = 7510 },
    @{ name = "Rewards-Service"; port = 7511 },
    @{ name = "Notification-Service"; port = 7512 },
    @{ name = "Transaction-Service"; port = 7509 },
    @{ name = "Payment-Services"; port = 7508 }
)

foreach ($svc in $services) {
    if (-not (Test-Port $svc.port)) {
        Write-Host "Starting $($svc.name) on port $($svc.port)..." -ForegroundColor Cyan
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$basePath\$($svc.name)'; mvn spring-boot:run"
        Start-Sleep -Seconds 10
    } else {
        Write-Host "$($svc.name) is already running on port $($svc.port)." -ForegroundColor Green
    }
}

Write-Host "All missing services have been triggered." -ForegroundColor Green
