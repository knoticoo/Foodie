#!/bin/bash

echo "=== Food Application Diagnostic Script ==="
echo "Running at $(date)"
echo ""

cd /workspace

echo "=== 1. Docker and Environment Check ==="
if command -v docker >/dev/null 2>&1; then
    echo "✓ Docker is installed: $(docker --version)"
    if sudo docker ps >/dev/null 2>&1; then
        echo "✓ Docker daemon is running"
        echo "Active containers:"
        sudo docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    else
        echo "✗ Docker daemon is not accessible"
    fi
else
    echo "✗ Docker is not installed"
fi

echo ""
echo "=== 2. Environment Configuration ==="
if [[ -f .env ]]; then
    echo "✓ .env file exists"
    echo "Key settings:"
    grep -E "^(API_HOST|API_PORT|CORS_ORIGIN|POSTGRES_)" .env || echo "No basic settings found"
else
    echo "✗ .env file missing"
fi

echo ""
echo "=== 3. Database Status ==="
if sudo docker exec recipes_db pg_isready -U recipes >/dev/null 2>&1; then
    echo "✓ Database is accessible"
    
    # Check if recipes table exists and has data
    recipe_count=$(sudo docker exec recipes_db psql -U recipes -d recipes -t -c "SELECT COUNT(*) FROM recipes;" 2>/dev/null | tr -d ' ')
    if [[ "$recipe_count" =~ ^[0-9]+$ ]]; then
        echo "✓ Recipes table exists with $recipe_count recipes"
        if [[ "$recipe_count" -eq 0 ]]; then
            echo "⚠ No recipes found in database - this explains why recipes are missing!"
        fi
    else
        echo "✗ Cannot query recipes table"
    fi
    
    # Check if admin user exists
    admin_count=$(sudo docker exec recipes_db psql -U recipes -d recipes -t -c "SELECT COUNT(*) FROM users WHERE is_admin = true;" 2>/dev/null | tr -d ' ')
    if [[ "$admin_count" =~ ^[0-9]+$ ]]; then
        echo "✓ Admin users in database: $admin_count"
        if [[ "$admin_count" -eq 0 ]]; then
            echo "⚠ No admin users found - this explains authentication issues!"
        fi
    else
        echo "✗ Cannot query users table"
    fi
else
    echo "✗ Database is not accessible"
fi

echo ""
echo "=== 4. API Health Check ==="
if curl -s --max-time 5 "http://localhost:3000/api/health" >/dev/null 2>&1; then
    echo "✓ API is responding"
    
    # Test recipes endpoint
    recipes_response=$(curl -s --max-time 5 "http://localhost:3000/api/recipes" 2>/dev/null)
    if [[ -n "$recipes_response" ]]; then
        echo "✓ Recipes endpoint is responding"
        recipes_count=$(echo "$recipes_response" | grep -o '"recipes":\[[^]]*\]' | grep -o '{' | wc -l)
        echo "  Found $recipes_count recipes in API response"
    else
        echo "✗ Recipes endpoint not responding"
    fi
else
    echo "✗ API is not responding"
fi

echo ""
echo "=== 5. Web Services Check ==="
if curl -s --max-time 5 "http://localhost:80" >/dev/null 2>&1; then
    echo "✓ Public web is accessible"
else
    echo "✗ Public web is not accessible"
fi

if curl -s --max-time 5 "http://localhost:5173" >/dev/null 2>&1; then
    echo "✓ Admin web is accessible"
else
    echo "✗ Admin web is not accessible"
fi

echo ""
echo "=== 6. Common Issues and Solutions ==="

if [[ "$recipe_count" -eq 0 ]]; then
    echo "ISSUE: No recipes in database"
    echo "SOLUTION: Run database seeding:"
    echo "  sudo docker exec -i recipes_db psql -U recipes -d recipes < database/init/100_seed.sql"
fi

if [[ "$admin_count" -eq 0 ]]; then
    echo "ISSUE: No admin users"
    echo "SOLUTION: Grant admin privileges:"
    echo "  sudo docker exec -i recipes_db psql -U recipes -d recipes < grant_admin_privileges.sql"
fi

echo ""
echo "=== 7. Recommended Fix Commands ==="
echo "To fix missing recipes:"
echo "  ./fix_missing_recipes.sh"
echo ""
echo "To fix authentication:"
echo "  ./run_sql.sh grant_admin_privileges.sql"
echo ""
echo "To restart all services:"
echo "  sudo docker compose down && sudo docker compose up -d --build"
echo ""
echo "To monitor services:"
echo "  ./monitor_services.sh"

echo ""
echo "=== Diagnostic Complete ==="