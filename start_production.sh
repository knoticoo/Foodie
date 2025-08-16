#!/bin/bash

# Production Startup Script for Recipe Application
# This script starts the backend with JSON storage for immediate deployment

set -e

echo "🚀 Starting Recipe Application for Production..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Step 1: Check environment
print_header "Checking Environment..."

if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    print_error "npm is not installed"
    exit 1
fi

NODE_VERSION=$(node --version)
print_status "Node.js version: $NODE_VERSION"

# Step 2: Set environment variables
print_header "Setting up environment..."

# Generate JWT secret if not set
if [ -z "$JWT_SECRET" ]; then
    export JWT_SECRET="production_secret_$(openssl rand -hex 32 2>/dev/null || echo "fallback_secret_$(date +%s)")"
    print_status "Generated JWT secret"
fi

# Set CORS origin for production
export CORS_ORIGIN="*"
export API_HOST="0.0.0.0"
export API_PORT="3000"

# Step 3: Check and install backend dependencies
print_header "Setting up backend..."

cd backend

if [ ! -d "node_modules" ]; then
    print_status "Installing backend dependencies..."
    npm install
else
    print_status "Backend dependencies already installed"
fi

# Step 4: Build backend
print_status "Building backend..."
npm run build

# Step 5: Create data directory for JSON storage
print_status "Setting up data storage..."
mkdir -p data

# Step 6: Start backend
print_header "Starting backend API..."

# Kill any existing backend processes
pkill -f "node dist/index.js" 2>/dev/null || true
sleep 2

# Start backend
print_status "Starting backend API on port 3000..."
JWT_SECRET="$JWT_SECRET" nohup npm run start > ../logs/backend.log 2>&1 &
BACKEND_PID=$!

# Wait for backend to start
print_status "Waiting for backend to initialize..."
sleep 5

# Test backend
for i in {1..10}; do
    if curl -s "http://localhost:3000/api/health" | grep -q "ok"; then
        print_status "✅ Backend API is running successfully!"
        break
    else
        if [ $i -eq 10 ]; then
            print_error "Backend failed to start after 10 attempts"
            echo "Check logs: tail -f logs/backend.log"
            exit 1
        fi
        print_status "Attempt $i/10: Waiting for backend..."
        sleep 2
    fi
done

# Step 7: Test recipe API
print_header "Testing recipe functionality..."

RECIPE_COUNT=$(curl -s "http://localhost:3000/api/recipes" | grep -o '"id":"' | wc -l || echo "0")
if [ "$RECIPE_COUNT" -gt 0 ]; then
    print_status "✅ Found $RECIPE_COUNT recipes in the database"
else
    print_warning "⚠️  No recipes found - this might be expected for a fresh install"
fi

# Step 8: Setup admin user login
print_header "Admin Access Information..."

echo ""
echo "🎉 ${GREEN}APPLICATION STARTED SUCCESSFULLY!${NC}"
echo ""
echo "📊 ${BLUE}Backend API:${NC}"
echo "   • Health: http://localhost:3000/api/health"
echo "   • Recipes: http://localhost:3000/api/recipes"
echo "   • Admin Stats: http://localhost:3000/api/admin/stats"
echo ""
echo "👤 ${BLUE}Admin Login Credentials:${NC}"
echo "   • Email: admin@virtuves-maksla.lv"
echo "   • Password: admin123"
echo "   • Admin Panel: http://localhost:5173 (when admin frontend is running)"
echo ""
echo "👨‍🍳 ${BLUE}Regular User Login:${NC}"
echo "   • Email: pavars@virtuves-maksla.lv"
echo "   • Password: admin123"
echo ""
echo "📝 ${BLUE}Available Data:${NC}"
echo "   • $RECIPE_COUNT recipes loaded"
echo "   • 2 users (1 admin, 1 regular)"
echo "   • Sample comments and ratings"
echo ""
echo "🔧 ${BLUE}Management:${NC}"
echo "   • Logs: tail -f logs/backend.log"
echo "   • Stop: pkill -f 'node dist/index.js'"
echo "   • Data: stored in backend/data/ (JSON files)"
echo ""

# Step 9: Keep monitoring (optional)
if [ "$1" = "--monitor" ]; then
    print_header "Monitoring mode (Ctrl+C to stop)..."
    while true; do
        if ! curl -s "http://localhost:3000/api/health" > /dev/null; then
            print_error "Backend API is not responding!"
            exit 1
        fi
        sleep 30
    done
fi

print_status "Backend is running in background (PID: $BACKEND_PID)"
print_status "Use 'tail -f logs/backend.log' to monitor"

cd ..