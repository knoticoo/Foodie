#!/bin/bash

# Master Installation Script for All Project Improvements
# This script installs dependencies and improvements across the entire project

set -e

echo "🚀 Installing ALL Project Improvements..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

print_header() {
    echo -e "${PURPLE}[HEADER]${NC} $1"
}

# Check if we're in the project root
if [ ! -f "docker-compose.yml" ]; then
    print_error "docker-compose.yml not found. Please run this script from the project root directory."
    exit 1
fi

print_header "🎯 Starting Complete Project Improvement Installation"
echo ""
print_status "This script will install improvements for:"
print_status "• Frontend (Main Site + Admin Panel)"
print_status "• Backend API"
print_status "• Database optimizations"
print_status "• Development tools"
print_status "• Monitoring & analytics"
print_status "• Security enhancements"
echo ""

# Confirm installation
read -p "Do you want to proceed? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_warning "Installation cancelled by user."
    exit 0
fi

# Make scripts executable
print_step "Making installation scripts executable..."
chmod +x install_frontend_improvements.sh
chmod +x install_backend_improvements.sh
print_status "Scripts made executable"

# Install system dependencies if needed
print_step "Checking system dependencies..."

# Check for required tools
if ! command -v node >/dev/null 2>&1; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

print_status "Node.js and npm are available"

# Backend improvements
print_header "🔧 Installing Backend Improvements..."
echo ""
cd backend
if [ -f "../install_backend_improvements.sh" ]; then
    bash ../install_backend_improvements.sh
else
    print_error "Backend installation script not found!"
    exit 1
fi
cd ..
print_status "Backend improvements installation completed!"
echo ""

# Main site frontend improvements
print_header "🎨 Installing Main Site Frontend Improvements..."
echo ""
cd site/web
if [ -f "../../install_frontend_improvements.sh" ]; then
    bash ../../install_frontend_improvements.sh
else
    print_error "Frontend installation script not found!"
    exit 1
fi
cd ../..
print_status "Main site frontend improvements installation completed!"
echo ""

# Admin panel frontend improvements  
print_header "⚙️ Installing Admin Panel Frontend Improvements..."
echo ""
cd admin/web
if [ -f "../../install_frontend_improvements.sh" ]; then
    bash ../../install_frontend_improvements.sh
else
    print_error "Frontend installation script not found!"
    exit 1
fi
cd ../..
print_status "Admin panel frontend improvements installation completed!"
echo ""

# Database improvements (if needed)
print_header "🗄️ Setting up Database Improvements..."
echo ""

# Create database optimization scripts
if [ ! -f "database_optimizations.sql" ]; then
    cat > database_optimizations.sql << 'EOF'
-- Database Performance Optimizations
-- Run this after your regular database setup

-- Add indexes for common queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_recipes_search 
    ON recipes USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '')));

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_recipes_created_at 
    ON recipes(created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_recipes_is_approved 
    ON recipes(is_approved) WHERE is_approved = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_recipe_ratings_recipe_id 
    ON recipe_ratings(recipe_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_recipe_comments_recipe_id 
    ON recipe_comments(recipe_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_favorites_user_id 
    ON favorites(user_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_product_prices_product_id_date 
    ON product_prices(product_id, date_updated DESC);

-- Update table statistics
ANALYZE recipes;
ANALYZE recipe_ratings;
ANALYZE recipe_comments;
ANALYZE favorites;
ANALYZE product_prices;

-- Enable query logging for performance monitoring (adjust as needed)
-- ALTER SYSTEM SET log_min_duration_statement = 1000; -- Log queries taking > 1s
-- SELECT pg_reload_conf();
EOF
    print_status "Created database_optimizations.sql"
fi

# Create Redis setup script
if [ ! -f "setup_redis.sh" ]; then
    cat > setup_redis.sh << 'EOF'
#!/bin/bash

# Redis Setup Script
echo "Setting up Redis for caching..."

# Check if Redis is available
if command -v redis-server >/dev/null 2>&1; then
    echo "Redis is already installed"
else
    echo "Installing Redis..."
    
    # Install Redis based on OS
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Ubuntu/Debian
        if command -v apt-get >/dev/null 2>&1; then
            sudo apt-get update
            sudo apt-get install -y redis-server
        # CentOS/RHEL
        elif command -v yum >/dev/null 2>&1; then
            sudo yum install -y redis
        fi
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command -v brew >/dev/null 2>&1; then
            brew install redis
        fi
    fi
fi

# Start Redis service
if command -v systemctl >/dev/null 2>&1; then
    sudo systemctl start redis-server
    sudo systemctl enable redis-server
elif command -v service >/dev/null 2>&1; then
    sudo service redis-server start
fi

echo "Redis setup completed!"
EOF
    chmod +x setup_redis.sh
    print_status "Created setup_redis.sh"
fi

# DevOps and monitoring setup
print_header "🔍 Setting up DevOps & Monitoring Tools..."
echo ""

# Create GitHub Actions workflow
mkdir -p .github/workflows
if [ ! -f ".github/workflows/ci.yml" ]; then
    cat > .github/workflows/ci.yml << 'EOF'
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test-backend:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: test_password
          POSTGRES_USER: test_user
          POSTGRES_DB: test_recipes_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
        cache-dependency-path: backend/package-lock.json
    
    - name: Install backend dependencies
      working-directory: backend
      run: npm ci
    
    - name: Run backend linting
      working-directory: backend
      run: npm run lint
    
    - name: Run backend tests
      working-directory: backend
      run: npm run test
      env:
        NODE_ENV: test
        DB_HOST: localhost
        DB_PORT: 5432
        DB_NAME: test_recipes_db
        DB_USER: test_user
        DB_PASSWORD: test_password
        JWT_SECRET: test_jwt_secret

  test-frontend:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        app: [site/web, admin/web]
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
        cache-dependency-path: ${{ matrix.app }}/package-lock.json
    
    - name: Install dependencies
      working-directory: ${{ matrix.app }}
      run: npm ci
    
    - name: Run linting
      working-directory: ${{ matrix.app }}
      run: npm run lint
    
    - name: Run tests
      working-directory: ${{ matrix.app }}
      run: npm run test
    
    - name: Build application
      working-directory: ${{ matrix.app }}
      run: npm run build

  e2e-tests:
    runs-on: ubuntu-latest
    needs: [test-backend, test-frontend]
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
    
    - name: Install Playwright
      working-directory: site/web
      run: |
        npm ci
        npx playwright install --with-deps
    
    - name: Run E2E tests
      working-directory: site/web
      run: npm run test:e2e

  security-scan:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Run npm audit
      run: |
        cd backend && npm audit --audit-level moderate
        cd ../site/web && npm audit --audit-level moderate
        cd ../admin/web && npm audit --audit-level moderate
EOF
    print_status "Created GitHub Actions CI/CD pipeline"
fi

# Create Docker optimization
if [ ! -f "docker-compose.prod.yml" ]; then
    cat > docker-compose.prod.yml << 'EOF'
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      target: production
    environment:
      NODE_ENV: production
      ENABLE_COMPRESSION: true
      ENABLE_RATE_LIMITING: true
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    deploy:
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M

  site:
    build:
      context: ./site/web
      target: production
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:80"]
      interval: 30s
      timeout: 10s
      retries: 3

  admin:
    build:
      context: ./admin/web
      target: production
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:80"]
      interval: 30s
      timeout: 10s
      retries: 3

  redis:
    image: redis:7-alpine
    command: redis-server --maxmemory 256mb --maxmemory-policy allkeys-lru
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3
    volumes:
      - redis_data:/data

volumes:
  redis_data:
EOF
    print_status "Created production Docker Compose configuration"
fi

# Create environment setup script
if [ ! -f "setup_development.sh" ]; then
    cat > setup_development.sh << 'EOF'
#!/bin/bash

# Development Environment Setup Script
echo "Setting up development environment..."

# Copy environment files if they don't exist
if [ ! -f "backend/.env" ] && [ -f "backend/.env.example" ]; then
    cp backend/.env.example backend/.env
    echo "Created backend/.env from example"
fi

# Install Git hooks for the entire project
if [ -d ".git" ]; then
    echo "Setting up Git hooks for the entire project..."
    
    # Create a pre-commit hook that runs linting for all components
    cat > .git/hooks/pre-commit << 'HOOK_EOF'
#!/bin/bash

# Pre-commit hook to run linting and formatting
echo "Running pre-commit checks..."

# Check backend
if [ -d "backend" ]; then
    echo "Checking backend..."
    cd backend
    npm run lint || exit 1
    cd ..
fi

# Check main site
if [ -d "site/web" ]; then
    echo "Checking main site..."
    cd site/web
    npm run lint || exit 1
    cd ../..
fi

# Check admin panel
if [ -d "admin/web" ]; then
    echo "Checking admin panel..."
    cd admin/web
    npm run lint || exit 1
    cd ../..
fi

echo "All pre-commit checks passed!"
HOOK_EOF

    chmod +x .git/hooks/pre-commit
    echo "Git hooks setup completed"
fi

echo "Development environment setup completed!"
EOF
    chmod +x setup_development.sh
    print_status "Created development environment setup script"
fi

# Summary and next steps
print_header "🎉 Installation Complete!"
echo ""
print_status "✅ Backend improvements installed"
print_status "✅ Main site frontend improvements installed"
print_status "✅ Admin panel frontend improvements installed"
print_status "✅ Database optimization scripts created"
print_status "✅ DevOps tools configured"
print_status "✅ Development environment scripts created"

echo ""
print_header "📋 Next Steps:"
echo ""
print_step "1. Database Optimization:"
echo "   Run: psql -U \$DB_USER -d \$DB_NAME -f database_optimizations.sql"

print_step "2. Redis Setup (optional but recommended):"
echo "   Run: ./setup_redis.sh"

print_step "3. Development Environment:"
echo "   Run: ./setup_development.sh"

print_step "4. Configure Environment Variables:"
echo "   • Copy backend/.env.example to backend/.env"
echo "   • Update database credentials"
echo "   • Add Sentry DSN for error tracking"
echo "   • Configure SMTP for email notifications"

print_step "5. Test Everything:"
echo "   • Backend: cd backend && npm run test"
echo "   • Main Site: cd site/web && npm run test"
echo "   • Admin Panel: cd admin/web && npm run test"

print_step "6. Code Quality:"
echo "   • Run linting: npm run lint (in each directory)"
echo "   • Run formatting: npm run format (in each directory)"

print_step "7. Performance Analysis:"
echo "   • Bundle analysis: npm run analyze"
echo "   • Lighthouse audit: npm run lighthouse"

print_step "8. Production Deployment:"
echo "   • Use docker-compose.prod.yml for production"
echo "   • Set up SSL certificates"
echo "   • Configure monitoring and alerts"

echo ""
print_header "🔗 Useful Commands:"
echo ""
echo "Frontend development:"
echo "  cd site/web && npm run dev"
echo "  cd admin/web && npm run dev"
echo ""
echo "Backend development:"
echo "  cd backend && npm run dev"
echo ""
echo "Testing:"
echo "  npm run test          # Unit tests"
echo "  npm run test:e2e      # E2E tests"
echo "  npm run test:coverage # Coverage report"
echo ""
echo "Code quality:"
echo "  npm run lint          # Check code quality"
echo "  npm run format        # Format code"
echo ""
echo "Performance:"
echo "  npm run analyze       # Bundle analysis"
echo "  npm run lighthouse    # Performance audit"

echo ""
print_status "🚀 Your project is now equipped with modern development tools!"
print_status "💡 Check the TODO list in your development environment for next features to implement."

echo ""
print_warning "⚠️  Remember to:"
print_warning "• Configure your environment variables"
print_warning "• Set up monitoring services (Sentry, analytics)"
print_warning "• Review security settings before production deployment"
print_warning "• Test all functionality after installation"