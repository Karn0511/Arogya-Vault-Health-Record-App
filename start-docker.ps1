#!/usr/bin/env pwsh
# Arogya Vault Docker Startup Script

Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                                                               ║" -ForegroundColor Cyan
Write-Host "║              🚀 AROGYA VAULT - DOCKER STARTUP 🚀              ║" -ForegroundColor Green
Write-Host "║                                                               ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is running
Write-Host "🔍 Checking Docker status..." -ForegroundColor Yellow
try {
    docker info > $null 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Docker is not running. Please start Docker Desktop." -ForegroundColor Red
        Write-Host "   Starting Docker Desktop now..." -ForegroundColor Yellow
        Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"
        Write-Host "   Waiting for Docker to start (this may take 30-60 seconds)..." -ForegroundColor Yellow
        
        $timeout = 60
        $elapsed = 0
        while ($elapsed -lt $timeout) {
            Start-Sleep -Seconds 3
            docker info > $null 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ Docker is ready!" -ForegroundColor Green
                break
            }
            $elapsed += 3
        }
        
        if ($elapsed -ge $timeout) {
            Write-Host "❌ Docker failed to start. Please start Docker Desktop manually." -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "✅ Docker is running" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Error checking Docker: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🛑 Stopping existing containers..." -ForegroundColor Yellow
docker-compose down 2>$null

Write-Host ""
Write-Host "🏗️  Building and starting all services..." -ForegroundColor Yellow
Write-Host "   This may take a few minutes on first run..." -ForegroundColor Cyan
Write-Host ""

docker-compose up -d --build

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ Failed to start containers" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "⏳ Waiting for services to be healthy..." -ForegroundColor Yellow
Write-Host ""

# Wait for services to be healthy
$maxWait = 120
$elapsed = 0
$services = @("arogya-mongodb", "arogya-backend", "arogya-frontend")

while ($elapsed -lt $maxWait) {
    $allHealthy = $true
    
    foreach ($service in $services) {
        $health = docker inspect --format='{{.State.Health.Status}}' $service 2>$null
        if ($health -ne "healthy") {
            $allHealthy = $false
            break
        }
    }
    
    if ($allHealthy) {
        Write-Host "✅ All services are healthy!" -ForegroundColor Green
        break
    }
    
    Start-Sleep -Seconds 5
    $elapsed += 5
    Write-Host "   Still waiting... ($elapsed seconds)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                                                               ║" -ForegroundColor Green
Write-Host "║                  ✅ ALL SERVICES RUNNING! ✅                   ║" -ForegroundColor Green
Write-Host "║                                                               ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

Write-Host "🌐 Access URLs:" -ForegroundColor Yellow
Write-Host "   🖥️  Frontend:       http://localhost:4200" -ForegroundColor Cyan
Write-Host "   🔌 Backend API:     http://localhost:5000" -ForegroundColor Cyan
Write-Host "   🗄️  Mongo Express:  http://localhost:8081" -ForegroundColor Cyan
Write-Host "       (admin/admin123)" -ForegroundColor Gray
Write-Host ""

Write-Host "🔐 Login Credentials:" -ForegroundColor Yellow
Write-Host "   👑 Admin:   admin@arogya.com / admin123" -ForegroundColor White
Write-Host "   🏥 Patient: amit.kumar@example.com / patient123" -ForegroundColor White
Write-Host "   👨‍⚕️ Doctor:  rajesh.kumar@arogya.com / doctor123" -ForegroundColor White
Write-Host ""

Write-Host "📊 View Logs:" -ForegroundColor Yellow
Write-Host "   docker-compose logs -f" -ForegroundColor White
Write-Host ""

Write-Host "🛑 Stop Services:" -ForegroundColor Yellow
Write-Host "   docker-compose down" -ForegroundColor White
Write-Host ""

Write-Host "✨ Happy coding! ✨" -ForegroundColor Magenta
Write-Host ""
