# Full Microservices Cluster Recovery Script v6
# Background start with NO Windows

$basePath = "C:\Users\Asus\Desktop\Payment-wallet"

# Env Vars for Overriding
$env:EUREKA_INSTANCE_PREFER_IP_ADDRESS = "false"
$env:EUREKA_INSTANCE_HOSTNAME = "localhost"
$env:SERVER_FORWARD_HEADERS_STRATEGY = "framework"
$env:SPRING_CLOUD_GATEWAY_GLOBALCORS_CORS_CONFIGURATIONS___ALLOWED_ORIGINS = "*"
$env:SPRING_CLOUD_GATEWAY_GLOBALCORS_CORS_CONFIGURATIONS___ALLOWED_METHODS = "*"

# 1. Aggressive Stop
Get-Process -Name "java" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 5

function Start-Service-Background($name, $path) {
    Write-Host "Starting $name..." -ForegroundColor Cyan
    $logDir = Join-Path $path "logs"
    if (-not (Test-Path $logDir)) { New-Item -ItemType Directory -Path $logDir -Force }
    $stdout = Join-Path $path "$($name.ToLower())_stdout.log"
    
    # Use -NoNewWindow and Redirect flags
    Start-Process -FilePath "mvn.cmd" -ArgumentList "spring-boot:run" -WorkingDirectory $path -NoNewWindow -RedirectStandardOutput $stdout -RedirectStandardError $stdout
}

# 2. Sequential Start
Start-Service-Background "Eureka-Server" "$basePath\Eureka-Server"
Write-Host "Waiting for Eureka (45s)..."
Start-Sleep -Seconds 45

Start-Service-Background "Config-Servier" "$basePath\Config-Servier"
Write-Host "Waiting for Config Server (35s)..."
Start-Sleep -Seconds 35

$others = @(
    "User-Service", "Admin-Service", "KYC-Services", "Wallet-Service", 
    "Payment-Services", "Api-Gateway", "Transaction-Service", 
    "Notification-Service", "Rewards-Service"
)

foreach ($svc in $others) {
    Start-Service-Background $svc "$basePath\$svc"
    Start-Sleep -Seconds 8
}

Write-Host "All services triggered in background. No windows opened." -ForegroundColor Green
Write-Host "Wait 2-3 mins for full startup." -ForegroundColor Yellow
