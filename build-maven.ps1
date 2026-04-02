# Build all Maven modules
$services = "Admin-Service", "Api-Gateway", "Config-Servier", "Eureka-Server", "KYC-Services", "Notification-Service", "Payment-Services", "Rewards-Service", "Transaction-Service", "User-Service", "Wallet-Service"

foreach ($service in $services) {
    Write-Host "Building $service..." -ForegroundColor Cyan
    Push-Location $service
    mvn clean package -DskipTests
    Pop-Location
}

Write-Host "All Maven builds completed!" -ForegroundColor Green
