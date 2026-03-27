# Full Microservices Cluster Recovery Script v5
# Using Environment Variable Overrides to Bypass Config Server Git Properties

$basePath = "C:\Users\Asus\Desktop\Payment-wallet"

# Env Vars for Overriding (Higher priority than Config Server)
$env:EUREKA_INSTANCE_PREFER_IP_ADDRESS = "false"
$env:EUREKA_INSTANCE_HOSTNAME = "localhost"
$env:SERVER_FORWARD_HEADERS_STRATEGY = "framework"

# Gateway Specific Overrides
$env:SPRING_CLOUD_GATEWAY_GLOBALCORS_CORS_CONFIGURATIONS___ALLOWED_ORIGINS = "*"
$env:SPRING_CLOUD_GATEWAY_GLOBALCORS_CORS_CONFIGURATIONS___ALLOWED_METHODS = "*"
$env:SPRING_CLOUD_GATEWAY_GLOBALCORS_CORS_CONFIGURATIONS___ALLOWED_HEADERS = "*"

function Test-Port($port) {
    return Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
}

# 1. Stop Everything First
Get-Process -Name "java" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

# 2. Eureka-Server (8761)
Write-Host "Starting Eureka-Server (8761)..." -ForegroundColor Cyan
Start-Process powershell -WindowStyle Hidden -ArgumentList "-Command", "cd '$basePath\Eureka-Server'; mvnw.cmd spring-boot:run > eureka_server_bg.log 2>&1"
Write-Host "Waiting for Eureka (40s)..."
Start-Sleep -Seconds 40

# 3. Config-Servier (7512)
Write-Host "Starting Config-Servier (7512)..." -ForegroundColor Cyan
Start-Process powershell -WindowStyle Hidden -ArgumentList "-Command", "cd '$basePath\Config-Servier'; mvnw.cmd spring-boot:run > config_server_bg.log 2>&1"
Write-Host "Waiting for Config Server (30s)..."
Start-Sleep -Seconds 30

# 4. All Other Services
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
    Write-Host "Starting $($svc.name) on port $($svc.port)..." -ForegroundColor Cyan
    $logFile = "$($svc.name.ToLower().Replace('-', '_'))_bg.log"
    # Pass environment variables to the new process
    Start-Process powershell -WindowStyle Hidden -ArgumentList "-Command", "`$env:EUREKA_INSTANCE_PREFER_IP_ADDRESS='false'; `$env:EUREKA_INSTANCE_HOSTNAME='localhost'; `$env:SERVER_FORWARD_HEADERS_STRATEGY='framework'; `$env:SPRING_CLOUD_GATEWAY_GLOBALCORS_CORS_CONFIGURATIONS___ALLOWED_ORIGINS='*'; cd '$basePath\$($svc.name)'; mvnw.cmd spring-boot:run > $logFile 2>&1"
    Start-Sleep -Seconds 5
}

Write-Host "All services triggered. Final check in 60s..." -ForegroundColor Yellow
Start-Sleep -Seconds 60

foreach ($svc in $services) {
    if (Test-Port $svc.port) {
        Write-Host "[UP] $($svc.name) (port $($svc.port))" -ForegroundColor Green
    } else {
        Write-Host "[STILL STARTING/FAILED] $($svc.name) (port $($svc.port))" -ForegroundColor Red
    }
}
