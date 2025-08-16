#!/bin/bash

# Backend Improvements Installation Script
# This script installs dependencies for performance, security, monitoring, and development tools

set -e

echo "🔧 Installing Backend Improvement Dependencies..."

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
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the backend directory."
    exit 1
fi

# Check for Node.js
if ! command -v node >/dev/null 2>&1; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi

print_step "Installing Performance & Caching Dependencies..."

# Redis for caching
npm install --save redis@^4.6.13
npm install --save-dev @types/redis@^4.0.11

# Compression middleware
npm install --save compression@^1.7.4
npm install --save-dev @types/compression@^1.7.5

# Rate limiting
npm install --save express-rate-limit@^7.1.5
npm install --save express-slow-down@^2.0.1

# Response caching
npm install --save apicache@^1.6.3
npm install --save-dev @types/apicache@^1.6.6

print_step "Installing Security Dependencies..."

# Security middleware
npm install --save helmet@^7.1.0
npm install --save express-validator@^7.0.1
npm install --save xss@^1.0.14
npm install --save-dev @types/xss@^1.0.4

# CSRF protection
npm install --save csurf@^1.11.0
npm install --save-dev @types/csurf@^1.11.5

# Session management
npm install --save express-session@^1.18.0
npm install --save connect-redis@^7.1.1
npm install --save-dev @types/express-session@^1.18.0

# Password security
npm install --save argon2@^0.31.2
npm install --save password-validator@^2.3.0

# Two-factor authentication
npm install --save speakeasy@^2.0.0
npm install --save qrcode@^1.5.3
npm install --save-dev @types/speakeasy@^2.0.10
npm install --save-dev @types/qrcode@^1.5.5

print_step "Installing Monitoring & Logging Dependencies..."

# Logging
npm install --save winston@^3.11.0
npm install --save morgan@^1.10.0
npm install --save-dev @types/morgan@^1.9.9

# Error tracking
npm install --save @sentry/node@^7.103.0
npm install --save @sentry/tracing@^7.103.0

# Performance monitoring
npm install --save prom-client@^15.1.0

# Health checks
npm install --save @godaddy/terminus@^4.12.1

print_step "Installing Testing Dependencies..."

# Testing framework
npm install --save-dev jest@^29.7.0
npm install --save-dev @types/jest@^29.5.12
npm install --save-dev ts-jest@^29.1.2
npm install --save-dev supertest@^6.3.4
npm install --save-dev @types/supertest@^6.0.2

# Database testing
npm install --save-dev @testcontainers/postgresql@^10.7.2

print_step "Installing Code Quality Dependencies..."

# Linting & Formatting
npm install --save-dev eslint@^8.57.0
npm install --save-dev @typescript-eslint/eslint-plugin@^6.21.0
npm install --save-dev @typescript-eslint/parser@^6.21.0
npm install --save-dev prettier@^3.2.5
npm install --save-dev eslint-config-prettier@^9.1.0
npm install --save-dev eslint-plugin-prettier@^5.1.3

# Git Hooks
npm install --save-dev husky@^9.0.11
npm install --save-dev lint-staged@^15.2.2

# API Documentation
npm install --save swagger-jsdoc@^6.2.8
npm install --save swagger-ui-express@^5.0.0
npm install --save-dev @types/swagger-jsdoc@^6.0.4
npm install --save-dev @types/swagger-ui-express@^4.1.6

print_step "Installing Database & Migration Dependencies..."

# Database migrations
npm install --save-dev db-migrate@^0.11.14
npm install --save-dev db-migrate-pg@^1.5.2

# Database connection pooling (enhanced)
npm install --save generic-pool@^3.9.0
npm install --save-dev @types/generic-pool@^3.9.4

# Query builder (alternative to raw SQL)
npm install --save knex@^3.1.0
npm install --save-dev @types/knex@^0.16.1

print_step "Installing File Handling Dependencies..."

# File upload
npm install --save multer@^1.4.5-lts.1
npm install --save-dev @types/multer@^1.4.11

# Image processing
npm install --save sharp@^0.33.2

# File validation
npm install --save file-type@^19.0.0

# Cloud storage (optional)
npm install --save aws-sdk@^2.1554.0

print_step "Installing Email & Notifications..."

# Email sending
npm install --save nodemailer@^6.9.9
npm install --save-dev @types/nodemailer@^6.4.14

# Email templates
npm install --save handlebars@^4.7.8
npm install --save-dev @types/handlebars@^4.1.0

print_step "Installing Utility Dependencies..."

# Validation
npm install --save joi@^17.12.1
npm install --save-dev @types/joi@^17.2.3

# Date manipulation
npm install --save date-fns@^3.3.1

# UUID generation
npm install --save uuid@^9.0.1
npm install --save-dev @types/uuid@^9.0.8

# Async utilities
npm install --save async@^3.2.5
npm install --save-dev @types/async@^3.2.24

# Environment validation
npm install --save envalid@^8.0.0

print_step "Installing Development Tools..."

# Hot reload for development
npm install --save-dev nodemon@^3.0.3

# Process management
npm install --save-dev concurrently@^8.2.2

# Bundle analysis
npm install --save-dev webpack-bundle-analyzer@^4.10.1

print_step "Creating configuration files..."

# Create basic Jest config if it doesn't exist
if [ ! -f "jest.config.js" ]; then
    cat > jest.config.js << 'EOF'
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: [
    '**/__tests__/**/*.ts',
    '**/?(*.)+(spec|test).ts'
  ],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/index.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
};
EOF
    print_status "Created jest.config.js"
fi

# Create setupTests.ts if it doesn't exist
if [ ! -f "src/setupTests.ts" ]; then
    mkdir -p src
    cat > src/setupTests.ts << 'EOF'
// Global test setup
import { config } from 'dotenv';

// Load test environment variables
config({ path: '.env.test' });

// Set test environment
process.env.NODE_ENV = 'test';

// Mock console methods in tests to reduce noise
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Global test timeout
jest.setTimeout(30000);
EOF
    print_status "Created src/setupTests.ts"
fi

# Create basic ESLint config if it doesn't exist
if [ ! -f ".eslintrc.json" ]; then
    cat > .eslintrc.json << 'EOF'
{
  "extends": [
    "eslint:recommended",
    "@typescript-eslint/recommended",
    "prettier"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module"
  },
  "plugins": [
    "@typescript-eslint",
    "prettier"
  ],
  "rules": {
    "prettier/prettier": "error",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "no-console": ["warn", { "allow": ["warn", "error"] }]
  },
  "env": {
    "node": true,
    "es2021": true,
    "jest": true
  },
  "ignorePatterns": ["dist/", "node_modules/", "*.js"]
}
EOF
    print_status "Created .eslintrc.json"
fi

# Create Prettier config if it doesn't exist
if [ ! -f ".prettierrc" ]; then
    cat > .prettierrc << 'EOF'
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
EOF
    print_status "Created .prettierrc"
fi

# Create Swagger configuration
if [ ! -f "src/config/swagger.ts" ]; then
    mkdir -p src/config
    cat > src/config/swagger.ts << 'EOF'
import swaggerJSDoc from 'swagger-jsdoc';
import { SwaggerDefinition } from 'swagger-jsdoc';

const swaggerDefinition: SwaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Virtuves Māksla API',
    version: '1.0.0',
    description: 'Recipe management and cooking platform API',
    contact: {
      name: 'API Support',
      email: 'support@virtuves-maksla.lv',
    },
  },
  servers: [
    {
      url: process.env.API_BASE_URL || 'http://localhost:3000',
      description: 'Development server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
};

const options = {
  definition: swaggerDefinition,
  apis: ['./src/routes/*.ts'], // Path to the API files
};

export const swaggerSpec = swaggerJSDoc(options);
EOF
    print_status "Created src/config/swagger.ts"
fi

# Create environment validation
if [ ! -f "src/config/env.validation.ts" ]; then
    cat > src/config/env.validation.ts << 'EOF'
import { cleanEnv, str, port, bool } from 'envalid';

export const validateEnv = () => {
  return cleanEnv(process.env, {
    NODE_ENV: str({ choices: ['development', 'test', 'production'] }),
    PORT: port({ default: 3000 }),
    
    // Database
    DB_HOST: str(),
    DB_PORT: port({ default: 5432 }),
    DB_NAME: str(),
    DB_USER: str(),
    DB_PASSWORD: str(),
    
    // JWT
    JWT_SECRET: str(),
    JWT_EXPIRES_IN: str({ default: '7d' }),
    
    // Redis (optional)
    REDIS_URL: str({ default: 'redis://localhost:6379' }),
    
    // Email (optional)
    SMTP_HOST: str({ default: 'localhost' }),
    SMTP_PORT: port({ default: 587 }),
    SMTP_USER: str({ default: '' }),
    SMTP_PASS: str({ default: '' }),
    
    // Monitoring
    SENTRY_DSN: str({ default: '' }),
    
    // Features
    ENABLE_RATE_LIMITING: bool({ default: true }),
    ENABLE_COMPRESSION: bool({ default: true }),
    ENABLE_CORS: bool({ default: true }),
  });
};
EOF
    print_status "Created src/config/env.validation.ts"
fi

# Update package.json scripts
print_step "Updating package.json scripts..."

# Add new scripts to package.json using Node.js
node -e "
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

// Add new scripts
pkg.scripts = pkg.scripts || {};
Object.assign(pkg.scripts, {
  'test': 'jest',
  'test:watch': 'jest --watch',
  'test:coverage': 'jest --coverage',
  'test:e2e': 'jest --testPathPattern=e2e',
  'lint': 'eslint src --ext .ts',
  'lint:fix': 'eslint src --ext .ts --fix',
  'format': 'prettier --write src/**/*.ts',
  'format:check': 'prettier --check src/**/*.ts',
  'dev:debug': 'NODE_ENV=development DEBUG=* ts-node-dev --respawn --transpile-only src/index.ts',
  'migrate:up': 'db-migrate up',
  'migrate:down': 'db-migrate down',
  'migrate:create': 'db-migrate create',
  'swagger': 'node -e \"console.log(JSON.stringify(require(\\\"./dist/config/swagger.js\\\").swaggerSpec, null, 2))\"',
  'prepare': 'husky install'
});

fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
console.log('Updated package.json scripts');
"

# Create .env.example if it doesn't exist
if [ ! -f ".env.example" ]; then
    cat > .env.example << 'EOF'
# Environment
NODE_ENV=development
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=recipes_db
DB_USER=recipes_user
DB_PASSWORD=recipes_password

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Redis (optional)
REDIS_URL=redis://localhost:6379

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Monitoring
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id

# Features
ENABLE_RATE_LIMITING=true
ENABLE_COMPRESSION=true
ENABLE_CORS=true

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# API Keys
STRIPE_SECRET_KEY=sk_test_your_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
EOF
    print_status "Created .env.example"
fi

# Initialize Husky for Git hooks
if command -v git >/dev/null 2>&1 && [ -d ".git" ] || git rev-parse --git-dir > /dev/null 2>&1; then
    print_step "Setting up Git hooks with Husky..."
    npx husky install
    npx husky add .husky/pre-commit "npx lint-staged"
    
    # Create lint-staged config
    cat > .lintstagedrc.json << 'EOF'
{
  "*.ts": [
    "eslint --fix",
    "prettier --write"
  ],
  "*.{json,md}": [
    "prettier --write"
  ]
}
EOF
    print_status "Set up Git hooks and lint-staged"
else
    print_warning "Git repository not found. Skipping Git hooks setup."
fi

print_step "Installation Summary"
echo ""
print_status "✅ Performance & caching tools installed (Redis, compression)"
print_status "✅ Security middleware installed (Helmet, rate limiting, validation)"
print_status "✅ Monitoring & logging tools installed (Winston, Sentry)"
print_status "✅ Testing framework installed (Jest, Supertest)"
print_status "✅ Code quality tools installed (ESLint, Prettier)"
print_status "✅ Database tools installed (migrations, connection pooling)"
print_status "✅ File handling tools installed (Multer, Sharp)"
print_status "✅ API documentation tools installed (Swagger)"
print_status "✅ Development tools installed"
print_status "✅ Configuration files created"

echo ""
print_step "Next Steps:"
echo "1. Copy .env.example to .env and configure your environment variables"
echo "2. Run 'npm run lint' to check code quality"
echo "3. Run 'npm run test' to run tests"
echo "4. Run 'npm run migrate:up' to run database migrations"
echo "5. Configure Redis and Sentry for production"
echo "6. Set up SMTP for email notifications"
echo "7. Configure file upload limits and storage"

echo ""
print_status "🎉 Backend improvement dependencies installation complete!"

print_step "Security Reminder:"
print_warning "Remember to:"
print_warning "- Change default JWT secrets in production"
print_warning "- Set up proper CORS origins"
print_warning "- Configure rate limiting for your use case"
print_warning "- Set up SSL/TLS certificates"
print_warning "- Review and update security headers"