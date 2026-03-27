$services = @(
    @{ name = "Eureka-Server"; dir = "Eureka-Server"; log = "eureka_final.log" },
    @{ name = "Config-Servier"; dir = "Config-Servier"; log = "config_final.log" },
    @{ name = "User-Service"; dir = "User-Service"; log = "user_final.log" },
    @{ name = "Admin-Service"; dir = "Admin-Service"; log = "admin_final.log" },
    @{ name = "KYC-Services"; dir = "KYC-Services"; log = "kyc_final.log" },
    @{ name = "Api-Gateway"; dir = "Api-Gateway"; log = "gateway_final.log" },
    @{ name = "Wallet-Service"; dir = "Wallet-Service"; log = "wallet_final.log" },
    @{ name = "Transaction-Service"; dir = "Transaction-Service"; log = "transaction_final.log" },
    @{ name = "Payment-Services"; dir = "Payment-Services"; log = "payment_final.log" },
    @{ name = "Notification-Service"; dir = "Notification-Service"; log = "notification_final.log" },
    @{ name = "Rewards-Service"; dir = "Rewards-Service"; log = "rewards_final.log" }
)

$env:EUREKA_INSTANCE_PREFER_IP_ADDRESS = 'false'
$env:EUREKA_INSTANCE_HOSTNAME = 'localhost'
$env:SERVER_FORWARD_HEADERS_STRATEGY = 'framework'

foreach ($s in $services) {
    Write-Host "Starting $($s.name)..."
    $workDir = Join-Path $PWD $s.dir
    $logPath = Join-Path $PWD $s.log
    $errPath = Join-Path $PWD "$($s.log)_err"
    
    # Use cmd /c and start to background correctly
    Start-Process -FilePath "mvn.cmd" -ArgumentList "spring-boot:run" -WorkingDirectory $workDir -NoNewWindow -RedirectStandardOutput $logPath -RedirectStandardError $errPath
    
    if ($s.name -eq "Eureka-Server" -or $s.name -eq "Config-Servier") {
        Write-Host "Waiting 15s for critical infrastructure..."
        Start-Sleep -Seconds 15
    } else {
        Start-Sleep -Seconds 5
    }
}
Write-Host "All services startup initiated."
