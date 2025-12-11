#!/bin/bash
# Arogya Vault Docker Startup Script

echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                                                               ║"
echo "║              🚀 AROGYA VAULT - DOCKER STARTUP 🚀              ║"
echo "║                                                               ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# Check if Docker is running
echo "🔍 Checking Docker status..."
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop."
    exit 1
fi
echo "✅ Docker is running"

echo ""
echo "🛑 Stopping existing containers..."
docker-compose down 2>/dev/null

echo ""
echo "🏗️  Building and starting all services..."
echo "   This may take a few minutes on first run..."
echo ""

docker-compose up -d --build

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Failed to start containers"
    exit 1
fi

echo ""
echo "⏳ Waiting for services to be healthy..."
echo ""

# Wait for services to be healthy
max_wait=120
elapsed=0
services=("arogya-mongodb" "arogya-backend" "arogya-frontend")

while [ $elapsed -lt $max_wait ]; do
    all_healthy=true
    
    for service in "${services[@]}"; do
        health=$(docker inspect --format='{{.State.Health.Status}}' $service 2>/dev/null)
        if [ "$health" != "healthy" ]; then
            all_healthy=false
            break
        fi
    done
    
    if [ "$all_healthy" = true ]; then
        echo "✅ All services are healthy!"
        break
    fi
    
    sleep 5
    elapsed=$((elapsed + 5))
    echo "   Still waiting... ($elapsed seconds)"
done

echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                                                               ║"
echo "║                  ✅ ALL SERVICES RUNNING! ✅                   ║"
echo "║                                                               ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

echo "🌐 Access URLs:"
echo "   🖥️  Frontend:       http://localhost:4200"
echo "   🔌 Backend API:     http://localhost:5000"
echo "   🗄️  Mongo Express:  http://localhost:8081"
echo "       (admin/admin123)"
echo ""

echo "🔐 Login Credentials:"
echo "   👑 Admin:   admin@arogya.com / admin123"
echo "   🏥 Patient: amit.kumar@example.com / patient123"
echo "   👨‍⚕️ Doctor:  rajesh.kumar@arogya.com / doctor123"
echo ""

echo "📊 View Logs:"
echo "   docker-compose logs -f"
echo ""

echo "🛑 Stop Services:"
echo "   docker-compose down"
echo ""

echo "✨ Happy coding! ✨"
echo ""
