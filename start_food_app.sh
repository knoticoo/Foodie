#!/bin/bash
set -e

echo "=== Food Application Startup Script ==="
echo "Starting at $(date)"

# Navigate to workspace
cd /workspace

# Check if Docker is accessible
if ! sudo docker ps >/dev/null 2>&1; then
    echo "Starting Docker daemon..."
    sudo systemctl start docker 2>/dev/null || {
        echo "Starting Docker daemon manually..."
        sudo dockerd >/dev/null 2>&1 &
        sleep 10
    }
fi

# Create required directories
echo "Creating required directories..."
mkdir -p nginx/static/images

# Build and start services
echo "Building and starting services..."
sudo docker compose down 2>/dev/null || true
sudo docker compose up -d --build

# Wait for database to be ready
echo "Waiting for database to be ready..."
sleep 15

# Grant admin privileges
echo "Granting admin privileges..."
if [ -f grant_admin_privileges.sql ]; then
    sudo docker exec -i recipes_db psql -U recipes -d recipes < grant_admin_privileges.sql || {
        echo "Note: Admin privileges script may have already been run"
    }
fi

# Apply database optimizations
echo "Applying database optimizations..."
if [ -f database_optimizations_advanced.sql ]; then
    sudo docker exec -i recipes_db psql -U recipes -d recipes < database_optimizations_advanced.sql || {
        echo "Note: Database optimizations may have already been applied"
    }
fi

# Show service status
echo ""
echo "=== Service Status ==="
sudo docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "=== Service URLs ==="
echo "- Public Web:  http://localhost/"
echo "- API:         http://localhost:3000"
echo "- Admin Web:   http://localhost:5173"
echo "- Static imgs: http://localhost:8080/images/"

echo ""
echo "=== Checking Service Health ==="

# Test API health
if curl -s --max-time 5 "http://localhost:3000/api/health" >/dev/null 2>&1; then
    echo "✓ API: Responding"
else
    echo "✗ API: Not responding (may still be starting up)"
fi

# Test web services
if curl -s --max-time 5 "http://localhost:80" >/dev/null 2>&1; then
    echo "✓ Public Web: Accessible"
else
    echo "✗ Public Web: Not accessible"
fi

if curl -s --max-time 5 "http://localhost:5173" >/dev/null 2>&1; then
    echo "✓ Admin Web: Accessible"
else
    echo "✗ Admin Web: Not accessible"
fi

echo ""
echo "=== Food Application Started Successfully ==="
echo "To monitor logs: sudo docker compose logs -f"
echo "To stop services: sudo docker compose down"
echo ""