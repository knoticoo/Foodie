#!/bin/bash

# Frontend Improvements Installation Script
# This script installs dependencies for performance optimization, testing, and UX enhancements

set -e

echo "🚀 Installing Frontend Improvement Dependencies..."

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
    print_error "package.json not found. Please run this script from the site/web or admin/web directory."
    exit 1
fi

print_step "Installing Performance Optimization Dependencies..."

# Performance & Bundle Analysis
npm install --save-dev webpack-bundle-analyzer@^4.10.1
npm install --save-dev @sentry/webpack-plugin@^2.14.0

# Progressive Web App
npm install --save workbox-webpack-plugin@^7.0.0
npm install --save workbox-window@^7.0.0

# Image Optimization
npm install --save-dev imagemin@^8.0.1
npm install --save-dev imagemin-webp@^8.0.0
npm install --save-dev imagemin-avif@^0.1.3
npm install --save-dev sharp@^0.33.2

print_step "Installing Testing Dependencies..."

# Testing Framework
npm install --save-dev jest@^29.7.0
npm install --save-dev @testing-library/react@^14.2.1
npm install --save-dev @testing-library/jest-dom@^6.4.2
npm install --save-dev @testing-library/user-event@^14.5.2
npm install --save-dev jest-environment-jsdom@^29.7.0

# E2E Testing
npm install --save-dev @playwright/test@^1.41.0
npm install --save-dev cross-env@^7.0.3

print_step "Installing Code Quality Dependencies..."

# Linting & Formatting
npm install --save-dev eslint@^8.57.0
npm install --save-dev @typescript-eslint/eslint-plugin@^6.21.0
npm install --save-dev @typescript-eslint/parser@^6.21.0
npm install --save-dev eslint-plugin-react@^7.33.2
npm install --save-dev eslint-plugin-react-hooks@^4.6.0
npm install --save-dev eslint-plugin-jsx-a11y@^6.8.0
npm install --save-dev prettier@^3.2.5
npm install --save-dev eslint-config-prettier@^9.1.0
npm install --save-dev eslint-plugin-prettier@^5.1.3

# Git Hooks
npm install --save-dev husky@^9.0.11
npm install --save-dev lint-staged@^15.2.2

print_step "Installing Accessibility Dependencies..."

# A11y Testing
npm install --save-dev @axe-core/react@^4.8.4
npm install --save-dev eslint-plugin-jsx-a11y@^6.8.0

print_step "Installing Error Tracking & Analytics..."

# Error Tracking
npm install --save @sentry/react@^7.103.0
npm install --save @sentry/tracing@^7.103.0

# Analytics (privacy-friendly)
npm install --save-dev @analytics/google-analytics@^0.5.3
npm install --save fathom-client@^3.6.0

print_step "Installing Performance Monitoring..."

# Core Web Vitals
npm install --save web-vitals@^3.5.2
npm install --save-dev lighthouse@^11.5.0

print_step "Installing UX Enhancement Dependencies..."

# Lazy Loading & Intersection Observer
npm install --save react-intersection-observer@^9.13.1
npm install --save @loadable/component@^5.16.0

# Virtual Scrolling (for large lists)
npm install --save react-window@^1.8.8
npm install --save react-window-infinite-loader@^1.0.9
npm install --save-dev @types/react-window@^1.8.8

# Advanced Animations
npm install --save react-spring@^9.7.3
npm install --save @react-spring/web@^9.7.3

# Toast Notifications (if not already installed)
if ! npm list react-hot-toast >/dev/null 2>&1; then
    npm install --save react-hot-toast@^2.4.1
fi

# Keyboard Shortcuts
npm install --save react-hotkeys-hook@^4.5.0

print_step "Installing Search & Autocomplete Dependencies..."

# Search functionality
npm install --save fuse.js@^7.0.0
npm install --save @tanstack/react-virtual@^3.0.1

# Autocomplete
npm install --save downshift@^8.3.2

print_step "Installing Form Enhancement Dependencies..."

# Advanced form handling (if not already installed)
if ! npm list react-hook-form >/dev/null 2>&1; then
    npm install --save react-hook-form@^7.53.1
    npm install --save @hookform/resolvers@^3.9.1
fi

# File upload with progress
npm install --save react-dropzone@^14.2.3

print_step "Installing Internationalization Dependencies..."

# i18n
npm install --save react-i18next@^14.0.5
npm install --save i18next@^23.8.2
npm install --save i18next-browser-languagedetector@^7.2.0

print_step "Installing Development Tools..."

# Bundle analysis
npm install --save-dev source-map-explorer@^2.5.3

# Performance profiling
npm install --save-dev why-did-you-render@^8.0.1

print_step "Creating configuration files..."

# Create basic Jest config if it doesn't exist
if [ ! -f "jest.config.js" ]; then
    cat > jest.config.js << 'EOF'
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapping: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.(ts|tsx|js)',
    '<rootDir>/src/**/?(*.)(spec|test).(ts|tsx|js)',
  ],
  collectCoverageFrom: [
    'src/**/*.(ts|tsx)',
    '!src/**/*.d.ts',
    '!src/main.tsx',
    '!src/vite-env.d.ts',
  ],
};
EOF
    print_status "Created jest.config.js"
fi

# Create setupTests.ts if it doesn't exist
if [ ! -f "src/setupTests.ts" ]; then
    mkdir -p src
    cat > src/setupTests.ts << 'EOF'
import '@testing-library/jest-dom';

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
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
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:jsx-a11y/recommended",
    "prettier"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaFeatures": {
      "jsx": true
    },
    "ecmaVersion": "latest",
    "sourceType": "module"
  },
  "plugins": [
    "react",
    "@typescript-eslint",
    "jsx-a11y",
    "prettier"
  ],
  "rules": {
    "prettier/prettier": "error",
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-explicit-any": "warn"
  },
  "settings": {
    "react": {
      "version": "detect"
    }
  },
  "env": {
    "browser": true,
    "es2021": true,
    "node": true,
    "jest": true
  }
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
  'test:e2e': 'playwright test',
  'lint': 'eslint src --ext .ts,.tsx,.js,.jsx',
  'lint:fix': 'eslint src --ext .ts,.tsx,.js,.jsx --fix',
  'format': 'prettier --write src/**/*.{ts,tsx,js,jsx,css,md}',
  'format:check': 'prettier --check src/**/*.{ts,tsx,js,jsx,css,md}',
  'analyze': 'npm run build && npx webpack-bundle-analyzer dist/static/js/*.js',
  'lighthouse': 'lighthouse http://localhost:5174 --output-path=./lighthouse-report.html --view',
  'prepare': 'husky install'
});

fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
console.log('Updated package.json scripts');
"

# Initialize Husky for Git hooks
if command -v git >/dev/null 2>&1 && [ -d ".git" ] || git rev-parse --git-dir > /dev/null 2>&1; then
    print_step "Setting up Git hooks with Husky..."
    npx husky install
    npx husky add .husky/pre-commit "npx lint-staged"
    
    # Create lint-staged config
    cat > .lintstagedrc.json << 'EOF'
{
  "*.{ts,tsx,js,jsx}": [
    "eslint --fix",
    "prettier --write"
  ],
  "*.{css,md,json}": [
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
print_status "✅ Performance optimization tools installed"
print_status "✅ Testing framework (Jest + Playwright) installed"
print_status "✅ Code quality tools (ESLint + Prettier) installed"
print_status "✅ Accessibility testing tools installed"
print_status "✅ Error tracking and analytics tools installed"
print_status "✅ UX enhancement libraries installed"
print_status "✅ Development tools installed"
print_status "✅ Configuration files created"

echo ""
print_step "Next Steps:"
echo "1. Run 'npm run lint' to check code quality"
echo "2. Run 'npm run test' to run tests"
echo "3. Run 'npm run analyze' to analyze bundle size"
echo "4. Configure Sentry error tracking with your project keys"
echo "5. Set up Playwright for E2E testing with 'npx playwright install'"

echo ""
print_status "🎉 Frontend improvement dependencies installation complete!"

# Check if we need to install Playwright browsers
if command -v npx >/dev/null 2>&1; then
    print_step "Installing Playwright browsers..."
    npx playwright install --with-deps
    print_status "Playwright browsers installed"
fi