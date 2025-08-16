#!/bin/bash

echo "=== Food Application Service Monitor ==="
echo "Press Ctrl+C to exit"
echo ""

while true; do
    clear
    echo "=== Food Application Service Monitor ==="
    echo "Last updated: $(date)"
    echo ""
    
    echo "=== Docker Container Status ==="
    if sudo docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null; then
        echo ""
    else
        echo "Error: Cannot connect to Docker daemon"
        echo ""
    fi
    
    echo "=== Service Health Checks ==="
    
    # Database health
    if sudo docker exec recipes_db pg_isready -U recipes >/dev/null 2>&1; then
        echo "✓ Database: Healthy"
    else
        echo "✗ Database: Unhealthy"
    fi
    
    # API health  
    if curl -s --max-time 3 "http://localhost:3000/api/health" >/dev/null 2>&1; then
        echo "✓ API: Responding"
    else
        echo "✗ API: Not responding"
    fi
    
    # Public web
    if curl -s --max-time 3 "http://localhost:80" >/dev/null 2>&1; then
        echo "✓ Public Web: Accessible"
    else
        echo "✗ Public Web: Not accessible"
    fi
    
    # Admin web
    if curl -s --max-time 3 "http://localhost:5173" >/dev/null 2>&1; then
        echo "✓ Admin Web: Accessible"
    else
        echo "✗ Admin Web: Not accessible"
    fi
    
    # Static files
    if curl -s --max-time 3 "http://localhost:8080" >/dev/null 2>&1; then
        echo "✓ Static Files: Accessible"
    else
        echo "✗ Static Files: Not accessible"
    fi
    
    echo ""
    echo "=== Service URLs ==="
    echo "- Public Web:  http://localhost/"
    echo "- API:         http://localhost:3000"
    echo "- Admin Web:   http://localhost:5173"
    echo "- Static imgs: http://localhost:8080/images/"
    
    echo ""
    echo "=== Quick Commands ==="
    echo "View logs: sudo docker compose logs -f"
    echo "Restart:   sudo docker compose restart"
    echo "Stop:      sudo docker compose down"
    
    echo ""
    echo "Monitoring... (Press Ctrl+C to exit)"
    
    sleep 30
done