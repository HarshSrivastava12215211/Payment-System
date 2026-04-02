# Build and Push Script for Payment Wallet Microservices
$DOCKER_USER = "harsh12215211"

Write-Host "Starting Maven build for all services..." -ForegroundColor Cyan
# In a real scenario, you might want to run mvn clean package in each directory
# But here we assume jars are already present or user will run it.
# To be safe, let's provide the command to build images directly.

Write-Host "Building Docker images using Docker Compose..." -ForegroundColor Cyan
docker-compose build

Write-Host "Pushing images to Docker Hub..." -ForegroundColor Cyan
docker-compose push

Write-Host "Done!" -ForegroundColor Green
