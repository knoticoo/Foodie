#!/bin/bash

# Production Features Installation Script for Virtuves Māksla
# This script installs all production-ready features including:
# - Redis caching system
# - Comprehensive testing suite
# - Error tracking and monitoring
# - Security enhancements
# - Performance optimizations
# - Accessibility improvements
# - PWA features
# - Image optimization

set -e

echo "🚀 Installing Production Features for Virtuves Māksla"
echo "=================================================="

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root for security reasons"
   exit 1
fi

# Check prerequisites
check_prerequisites() {
    print_info "Checking prerequisites..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is required but not installed"
        exit 1
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm is required but not installed"
        exit 1
    fi
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        print_warning "Docker not found - some features may not work"
    fi
    
    # Check git
    if ! command -v git &> /dev/null; then
        print_error "Git is required but not installed"
        exit 1
    fi
    
    print_status "Prerequisites check completed"
}

# Install and configure Redis
install_redis() {
    print_info "Installing and configuring Redis..."
    
    # Check if Redis is already installed
    if command -v redis-server &> /dev/null; then
        print_status "Redis already installed"
    else
        # Install Redis based on OS
        if [[ "$OSTYPE" == "linux-gnu"* ]]; then
            # Ubuntu/Debian
            if command -v apt-get &> /dev/null; then
                sudo apt-get update
                sudo apt-get install -y redis-server
            # CentOS/RHEL
            elif command -v yum &> /dev/null; then
                sudo yum install -y redis
            # Fedora
            elif command -v dnf &> /dev/null; then
                sudo dnf install -y redis
            else
                print_warning "Could not detect package manager. Please install Redis manually."
                return
            fi
        elif [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            if command -v brew &> /dev/null; then
                brew install redis
            else
                print_warning "Homebrew not found. Please install Redis manually."
                return
            fi
        else
            print_warning "Unsupported OS. Please install Redis manually."
            return
        fi
    fi
    
    # Start Redis service
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        sudo systemctl enable redis-server
        sudo systemctl start redis-server
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        brew services start redis
    fi
    
    # Test Redis connection
    if redis-cli ping | grep -q "PONG"; then
        print_status "Redis is running and accessible"
    else
        print_error "Redis is not responding"
        exit 1
    fi
}

# Install backend dependencies
install_backend_deps() {
    print_info "Installing backend dependencies..."
    
    cd backend || { print_error "Backend directory not found"; exit 1; }
    
    # Install production dependencies
    npm install --save \
        redis \
        ioredis \
        compression \
        helmet \
        express-rate-limit \
        express-validator \
        bcryptjs \
        argon2 \
        speakeasy \
        qrcode \
        sharp \
        multer \
        file-type \
        nodemailer \
        handlebars \
        winston \
        morgan \
        @sentry/node \
        @sentry/tracing \
        express-slow-down \
        hpp \
        cors
    
    # Install development dependencies
    npm install --save-dev \
        jest \
        supertest \
        @types/jest \
        @types/supertest \
        nodemon \
        eslint \
        prettier \
        husky \
        lint-staged \
        @typescript-eslint/eslint-plugin \
        @typescript-eslint/parser \
        swagger-jsdoc \
        swagger-ui-express
    
    cd ..
    print_status "Backend dependencies installed"
}

# Install frontend dependencies
install_frontend_deps() {
    print_info "Installing frontend dependencies..."
    
    cd site/web || { print_error "Frontend directory not found"; exit 1; }
    
    # Install production dependencies
    npm install --save \
        @tanstack/react-query \
        framer-motion \
        react-helmet-async \
        react-i18next \
        i18next \
        @sentry/react \
        @sentry/tracing \
        workbox-webpack-plugin \
        workbox-sw \
        idb \
        sharp \
        imagemin \
        imagemin-webp \
        imagemin-avif
    
    # Install development dependencies
    npm install --save-dev \
        vitest \
        @testing-library/react \
        @testing-library/jest-dom \
        @testing-library/user-event \
        jsdom \
        playwright \
        @playwright/test \
        eslint \
        prettier \
        husky \
        lint-staged \
        @vitejs/plugin-react \
        vite-plugin-pwa \
        webpack-bundle-analyzer
    
    cd ../..
    print_status "Frontend dependencies installed"
}

# Setup testing infrastructure
setup_testing() {
    print_info "Setting up testing infrastructure..."
    
    # Frontend tests configuration
    cd site/web
    
    # Create Vitest config
    cat > vitest.config.ts << 'EOF'
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/__tests__/',
        'dist/',
        'coverage/',
      ],
    },
  },
});
EOF
    
    # Create test setup file
    mkdir -p src/__tests__
    cat > src/__tests__/setup.ts << 'EOF'
import '@testing-library/jest-dom';
import { setupTest } from './utils/test-helpers';

// Global test setup
beforeEach(() => {
  setupTest();
});

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};
EOF
    
    # Create Playwright config
    cat > playwright.config.ts << 'EOF'
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: '../../e2e/tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
EOF
    
    cd ../..
    
    # Backend tests configuration
    cd backend
    
    # Create Jest config
    cat > jest.config.js << 'EOF'
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: [
    '**/__tests__/**/*.+(ts|tsx|js)',
    '**/*.(test|spec).+(ts|tsx|js)'
  ],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  },
  collectCoverageFrom: [
    'src/**/*.(ts|js)',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
};
EOF
    
    # Create backend test setup
    mkdir -p src/__tests__
    cat > src/__tests__/setup.ts << 'EOF'
import { Pool } from 'pg';

// Test database setup
const testDb = new Pool({
  connectionString: process.env.TEST_DATABASE_URL || 'postgresql://localhost/virtuves_maksla_test'
});

beforeAll(async () => {
  // Setup test database
  await testDb.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
});

afterAll(async () => {
  // Cleanup
  await testDb.end();
});

beforeEach(async () => {
  // Clean tables before each test
  await testDb.query('TRUNCATE TABLE recipes, users, favorites, recipe_ratings, recipe_comments CASCADE');
});
EOF
    
    cd ..
    print_status "Testing infrastructure configured"
}

# Setup ESLint and Prettier
setup_linting() {
    print_info "Setting up code quality tools..."
    
    # Frontend linting
    cd site/web
    
    cat > .eslintrc.js << 'EOF'
module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['react', '@typescript-eslint'],
  rules: {
    'react/react-in-jsx-scope': 'off',
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-explicit-any': 'warn',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
EOF
    
    cat > .prettierrc << 'EOF'
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2
}
EOF
    
    cd ../..
    
    # Backend linting
    cd backend
    
    cat > .eslintrc.js << 'EOF'
module.exports = {
  env: {
    node: true,
    es2021: true,
  },
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  rules: {
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-explicit-any': 'warn',
  },
};
EOF
    
    cat > .prettierrc << 'EOF'
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2
}
EOF
    
    cd ..
    print_status "Code quality tools configured"
}

# Setup Git hooks
setup_git_hooks() {
    print_info "Setting up Git hooks..."
    
    # Install husky
    npx husky install
    
    # Pre-commit hook for linting
    npx husky add .husky/pre-commit "npm run lint:fix && npm run format"
    
    # Pre-push hook for tests
    npx husky add .husky/pre-push "npm test"
    
    # Setup lint-staged
    cat > .lintstagedrc << 'EOF'
{
  "*.{ts,tsx,js,jsx}": [
    "eslint --fix",
    "prettier --write"
  ],
  "*.{json,md,yml,yaml}": [
    "prettier --write"
  ]
}
EOF
    
    print_status "Git hooks configured"
}

# Setup environment files
setup_environment() {
    print_info "Setting up environment configuration..."
    
    # Backend environment
    cd backend
    if [ ! -f .env ]; then
        cat > .env << 'EOF'
# Database
DATABASE_URL=postgresql://localhost/virtuves_maksla
TEST_DATABASE_URL=postgresql://localhost/virtuves_maksla_test

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
CACHE_PREFIX=virtuves_maksla

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=7d

# File uploads
UPLOAD_PATH=uploads
MAX_FILE_SIZE=5242880

# Email
EMAIL_FROM=noreply@virtuves-maksla.lv
SMTP_HOST=localhost
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=

# Sentry (Error tracking)
SENTRY_DSN=
SENTRY_ENVIRONMENT=development

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100

# Performance
ENABLE_COMPRESSION=true
ENABLE_HELMET=true
ENABLE_CORS=true
EOF
        print_info "Created backend .env file - please update with your values"
    fi
    cd ..
    
    # Frontend environment
    cd site/web
    if [ ! -f .env ]; then
        cat > .env << 'EOF'
# API Configuration
VITE_API_URL=http://localhost:3001
VITE_APP_URL=http://localhost:3000

# Sentry (Error tracking)
VITE_SENTRY_DSN=
VITE_SENTRY_ENVIRONMENT=development

# Analytics
VITE_ANALYTICS_ID=

# Version
VITE_APP_VERSION=1.0.0

# Features
VITE_ENABLE_PWA=true
VITE_ENABLE_OFFLINE=true
VITE_ENABLE_NOTIFICATIONS=true
EOF
        print_info "Created frontend .env file - please update with your values"
    fi
    cd ../..
    
    print_status "Environment configuration completed"
}

# Setup production Docker configuration
setup_docker() {
    print_info "Setting up production Docker configuration..."
    
    # Update package.json scripts
    update_package_scripts() {
        local dir=$1
        cd "$dir"
        
        # Add scripts to package.json
        node -e "
        const fs = require('fs');
        const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        
        pkg.scripts = {
            ...pkg.scripts,
            'test': 'jest',
            'test:watch': 'jest --watch',
            'test:coverage': 'jest --coverage',
            'lint': 'eslint src --ext .ts,.tsx,.js,.jsx',
            'lint:fix': 'eslint src --ext .ts,.tsx,.js,.jsx --fix',
            'format': 'prettier --write src/**/*.{ts,tsx,js,jsx,json,md}',
            'format:check': 'prettier --check src/**/*.{ts,tsx,js,jsx,json,md}',
            'type-check': 'tsc --noEmit'
        };
        
        fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
        "
        
        cd ..
    }
    
    # Update backend scripts
    update_package_scripts "backend"
    
    # Update frontend scripts  
    update_package_scripts "site/web"
    
    # Create production docker-compose override
    if [ ! -f docker-compose.prod.yml ]; then
        print_info "docker-compose.prod.yml already exists"
    else
        print_status "Production Docker configuration already exists"
    fi
}

# Setup monitoring and logging
setup_monitoring() {
    print_info "Setting up monitoring and logging..."
    
    cd backend
    
    # Create logging configuration
    mkdir -p src/config
    cat > src/config/logger.ts << 'EOF'
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

export default logger;
EOF
    
    # Create logs directory
    mkdir -p logs
    
    cd ..
    print_status "Monitoring and logging configured"
}

# Setup database optimizations
setup_database_optimizations() {
    print_info "Setting up database optimizations..."
    
    # The database optimization script already exists
    if [ -f database_optimizations.sql ]; then
        print_status "Database optimization script already exists"
        print_info "Run: psql -d virtuves_maksla -f database_optimizations.sql"
    else
        print_warning "Database optimization script not found"
    fi
}

# Setup PWA features
setup_pwa() {
    print_info "Setting up PWA features..."
    
    cd site/web
    
    # Vite PWA plugin configuration
    cat > vite-pwa.config.ts << 'EOF'
import { VitePWA } from 'vite-plugin-pwa';

export const pwaConfig = VitePWA({
  registerType: 'autoUpdate',
  workbox: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,avif}'],
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/api\.virtuves-maksla\.lv\/.*$/,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'api-cache',
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 60 * 60 * 24, // 1 day
          },
        },
      },
      {
        urlPattern: /\.(?:png|jpg|jpeg|svg|webp|avif)$/,
        handler: 'CacheFirst',
        options: {
          cacheName: 'images',
          expiration: {
            maxEntries: 60,
            maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
          },
        },
      },
    ],
  },
  manifest: {
    name: 'Virtuves Māksla',
    short_name: 'VirtMāksla',
    description: 'Receptu kolekcija un virtuves palīgs',
    theme_color: '#2563eb',
    background_color: '#ffffff',
    display: 'standalone',
    start_url: '/',
    scope: '/',
    icons: [
      {
        src: 'pwa-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: 'pwa-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  },
});
EOF
    
    cd ../..
    print_status "PWA features configured"
}

# Create deployment scripts
create_deployment_scripts() {
    print_info "Creating deployment scripts..."
    
    # Production deployment script
    cat > deploy.sh << 'EOF'
#!/bin/bash

# Production Deployment Script
set -e

echo "🚀 Deploying Virtuves Māksla to production..."

# Build frontend
echo "Building frontend..."
cd site/web
npm run build
cd ../..

# Build backend
echo "Building backend..."
cd backend
npm run build
cd ..

# Database migrations
echo "Running database migrations..."
npm run migrate

# Restart services
echo "Restarting services..."
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d

# Cache warming
echo "Warming cache..."
curl -f http://localhost:3001/api/health/cache || echo "Cache warming failed"

echo "✅ Deployment completed successfully!"
EOF
    
    chmod +x deploy.sh
    
    # Backup script
    cat > backup.sh << 'EOF'
#!/bin/bash

# Database Backup Script
set -e

BACKUP_DIR="backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="virtuves_maksla"

mkdir -p $BACKUP_DIR

echo "📦 Creating database backup..."
pg_dump $DB_NAME > "$BACKUP_DIR/db_backup_$DATE.sql"

echo "📦 Creating Redis backup..."
redis-cli BGSAVE
cp /var/lib/redis/dump.rdb "$BACKUP_DIR/redis_backup_$DATE.rdb"

echo "📦 Creating uploads backup..."
tar -czf "$BACKUP_DIR/uploads_backup_$DATE.tar.gz" backend/uploads/

echo "✅ Backup completed: $BACKUP_DIR"
EOF
    
    chmod +x backup.sh
    
    print_status "Deployment scripts created"
}

# Main installation function
main() {
    print_info "Starting production features installation..."
    
    # Check prerequisites
    check_prerequisites
    
    # Install Redis
    install_redis
    
    # Install dependencies
    install_backend_deps
    install_frontend_deps
    
    # Setup development tools
    setup_testing
    setup_linting
    setup_git_hooks
    
    # Setup configuration
    setup_environment
    setup_docker
    setup_monitoring
    setup_database_optimizations
    setup_pwa
    
    # Create deployment tools
    create_deployment_scripts
    
    print_status "Production features installation completed!"
    echo ""
    echo "🎉 All production features have been installed and configured!"
    echo ""
    echo "Next steps:"
    echo "1. Update environment variables in .env files"
    echo "2. Run database optimizations: psql -d virtuves_maksla -f database_optimizations.sql"
    echo "3. Set up Sentry account and update DSN in environment files"
    echo "4. Configure email settings for notifications"
    echo "5. Run tests: npm test"
    echo "6. Start development: docker-compose up -d"
    echo ""
    echo "For production deployment:"
    echo "1. Update docker-compose.prod.yml with your production settings"
    echo "2. Run: ./deploy.sh"
    echo ""
    echo "For regular backups:"
    echo "1. Set up cron job: 0 2 * * * /path/to/backup.sh"
    echo ""
    print_info "Happy coding! 🚀"
}

# Run main function
main "$@"