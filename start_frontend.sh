#!/bin/bash

# Frontend Startup Script for Recipe Application
# This script starts both the public site and admin panel

set -e

echo "🎨 Starting Recipe Application Frontend..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_header() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if backend is running
print_header "Checking Backend API..."

if ! curl -s "http://localhost:3000/api/health" > /dev/null; then
    print_error "Backend API is not running!"
    echo "Please start the backend first with: ./start_production.sh"
    exit 1
fi

print_status "✅ Backend API is running"

# Start Admin Panel
print_header "Starting Admin Panel..."

cd admin/web

if [ ! -d "node_modules" ]; then
    print_status "Installing admin dependencies..."
    npm install
else
    print_status "Admin dependencies already installed"
fi

# Set environment variables for admin
export VITE_API_BASE_URL="http://localhost:3000"
export VITE_STATIC_BASE_URL="http://localhost:8080"

print_status "Starting admin panel on port 5173..."
npm run dev -- --host 0.0.0.0 --port 5173 > ../../logs/admin.log 2>&1 &
ADMIN_PID=$!

cd ../../

# Start Public Site
print_header "Starting Public Site..."

cd site/web

if [ ! -d "node_modules" ]; then
    print_status "Installing site dependencies..."
    npm install
else
    print_status "Site dependencies already installed"
fi

# Set environment variables for public site
export VITE_API_BASE_URL="http://localhost:3000"
export VITE_STATIC_BASE_URL="http://localhost:8080"
export VITE_ADMIN_WEB_URL="http://localhost:5173"

print_status "Starting public site on port 3001..."
npm run dev -- --host 0.0.0.0 --port 3001 > ../../logs/site.log 2>&1 &
SITE_PID=$!

cd ../../

# Wait for frontends to start
print_status "Waiting for frontends to initialize..."
sleep 10

# Test admin panel
print_status "Testing admin panel..."
if curl -s "http://localhost:5173" > /dev/null; then
    print_status "✅ Admin panel is running"
else
    print_error "❌ Admin panel failed to start"
fi

# Test public site
print_status "Testing public site..."
if curl -s "http://localhost:3001" > /dev/null; then
    print_status "✅ Public site is running"
else
    print_error "❌ Public site failed to start"
fi

echo ""
echo "🎉 ${GREEN}FRONTEND APPLICATIONS STARTED!${NC}"
echo ""
echo "🌐 ${BLUE}Application URLs:${NC}"
echo "   • Public Site: http://localhost:3001"
echo "   • Admin Panel: http://localhost:5173"
echo "   • Backend API: http://localhost:3000"
echo ""
echo "👤 ${BLUE}Login Credentials:${NC}"
echo "   • Admin: admin@virtuves-maksla.lv / admin123"
echo "   • User: pavars@virtuves-maksla.lv / admin123"
echo ""
echo "📝 ${BLUE}Logs:${NC}"
echo "   • Admin: tail -f logs/admin.log"
echo "   • Site: tail -f logs/site.log"
echo "   • Backend: tail -f logs/backend.log"
echo ""
echo "🛑 ${BLUE}Stop Services:${NC}"
echo "   • All: pkill -f 'vite\\|node dist/index.js'"
echo "   • Individual: kill $ADMIN_PID $SITE_PID"
echo ""

print_status "Frontend applications are running in background"
print_status "Press Ctrl+C to view logs, or use the commands above"