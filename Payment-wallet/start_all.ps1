# Start Eureka-Server
Write-Host "Starting Eureka-Server..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\Asus\Desktop\Payment-wallet\Eureka-Server'; mvn spring-boot:run"
Start-Sleep -Seconds 15

# Start Config-Server
Write-Host "Starting Config-Server..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\Asus\Desktop\Payment-wallet\Config-Servier'; mvn spring-boot:run"
Start-Sleep -Seconds 20

# Start All Other Services
$services = @(
    "User-Service",
    "KYC-Services",
    "Admin-Service",
    "Wallet-Service",
    "Payment-Services",
    "Transaction-Service",
    "Rewards-Service",
    "Notification-Service"
)

foreach ($service in $services) {
    Write-Host "Starting $service..." -ForegroundColor Cyan
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\Asus\Desktop\Payment-wallet\$service'; mvn spring-boot:run"
    Start-Sleep -Seconds 5
}

# Start Api-Gateway last
Start-Sleep -Seconds 10
Write-Host "Starting Api-Gateway..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\Asus\Desktop\Payment-wallet\Api-Gateway'; mvn spring-boot:run"

Write-Host "All services have been triggered to start in separate windows." -ForegroundColor Magenta
Write-Host "Please ensure you have created the databases: Rewards_Db, Notification_Db, Admin_Db." -ForegroundColor Red
