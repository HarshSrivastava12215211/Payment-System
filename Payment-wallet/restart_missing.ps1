# Start missing services in background PowerShell windows
$missing = @(
    "User-Service",
    "Admin-Service",
    "Wallet-Service",
    "Payment-Services",
    "Transaction-Service"
)

foreach ($service in $missing) {
    Write-Host "Cleaning and starting $service..." -ForegroundColor Cyan
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\Asus\Desktop\Payment-wallet\$service'; mvn clean compile; mvn spring-boot:run"
    Start-Sleep -Seconds 10
}

Write-Host "Startup commands for missing services have been triggered." -ForegroundColor Green
