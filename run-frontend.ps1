# ==========================================
# Payment Wallet - Frontend Auto-Run Script
# ==========================================

$FrontendPath = ".\frontend"

if (!(Test-Path $FrontendPath)) {
    Write-Host "Error: Cannot find 'frontend' directory." -ForegroundColor Red
    Exit
}

Set-Location $FrontendPath

Write-Host "Installing dependencies if missing..." -ForegroundColor Cyan
if (!(Test-Path "node_modules")) {
    npm install
} else {
    Write-Host "node_modules found. Skipping install." -ForegroundColor Green
}

Write-Host "Starting Angular Development Server..." -ForegroundColor Cyan
Write-Host "A new browser tab will launch automatically when ready." -ForegroundColor Yellow
npm start
