#!/usr/bin/env bash
set -euo pipefail

# Universal Food Application Service Manager
# This script handles all aspects of the food application: setup, database, services, and monitoring

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
LOG_FILE="/tmp/food_app_services.log"
DOCKER_TIMEOUT=30

# Logging function
log() {
    local level="$1"
    shift
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    local colored_level
    case "$level" in
        "INFO")  colored_level="${GREEN}[INFO]${NC}" ;;
        "WARN")  colored_level="${YELLOW}[WARN]${NC}" ;;
        "ERROR") colored_level="${RED}[ERROR]${NC}" ;;
        "DEBUG") colored_level="${BLUE}[DEBUG]${NC}" ;;
        *)       colored_level="[$level]" ;;
    esac
    echo -e "${colored_level} $timestamp: $*" | tee -a "$LOG_FILE"
}

# Error handling
error_exit() {
    log "ERROR" "$1"
    exit 1
}

# Check if running as root for certain operations
check_root() {
    if [[ $EUID -eq 0 ]]; then
        log "INFO" "Running as root"
    else
        log "WARN" "Some operations may require root privileges"
    fi
}

# Install dependencies if needed
install_dependencies() {
    log "INFO" "Checking and installing dependencies..."
    
    # Check if Docker is running (try to start it)
    if ! docker ps >/dev/null 2>&1; then
        log "WARN" "Docker daemon not running, attempting to start..."
        if command -v systemctl >/dev/null 2>&1; then
            sudo systemctl start docker || log "WARN" "Could not start Docker via systemctl"
        else
            # Try starting Docker directly
            sudo dockerd > /dev/null 2>&1 & 
            sleep 5
        fi
    fi
    
    # Check if Node.js is available
    if ! command -v node >/dev/null 2>&1; then
        log "ERROR" "Node.js not found. Please install Node.js 20.x"
        return 1
    fi
    
    # Check if npm is available
    if ! command -v npm >/dev/null 2>&1; then
        log "ERROR" "npm not found. Please install npm"
        return 1
    fi
    
    # Install PostgreSQL client if not available
    if ! command -v psql >/dev/null 2>&1; then
        log "INFO" "Installing PostgreSQL client..."
        sudo apt-get update && sudo apt-get install -y postgresql-client || log "WARN" "Could not install psql"
    fi
    
    log "INFO" "Dependencies check completed"
}

# Generate or update .env file
setup_env() {
    log "INFO" "Setting up environment configuration..."
    
    if [[ ! -f .env ]]; then
        if [[ -f .env.example ]]; then
            log "INFO" "Creating .env from .env.example"
            cp .env.example .env
        else
            log "INFO" "Creating minimal .env with defaults"
            cat > .env <<'EOF'
# Food Application Environment Configuration
API_HOST=0.0.0.0
API_PORT=3000
CORS_ORIGIN=*
JWT_SECRET=please_change_me
POSTGRES_HOST=db
POSTGRES_PORT=5432
POSTGRES_USER=recipes
POSTGRES_PASSWORD=recipes_password_change_me
POSTGRES_DB=recipes
# Admin Web URLs
ADMIN_WEB_API_BASE_URL=http://localhost:3000
ADMIN_WEB_STATIC_BASE_URL=http://localhost:8080
# Stripe (optional)
STRIPE_SECRET_KEY=
STRIPE_PRICE_ID=
STRIPE_WEBHOOK_SECRET=
EOF
        fi
    fi

    # Generate JWT secret if needed
    if grep -q "JWT_SECRET=please_change_me" .env || ! grep -q "JWT_SECRET=" .env; then
        local jwt_secret=$(head -c 32 /dev/urandom | base64 | tr -d '\n=/+' | head -c 48)
        if grep -q "JWT_SECRET=" .env; then
            sed -i "s|^JWT_SECRET=.*$|JWT_SECRET=${jwt_secret}|" .env
        else
            echo "JWT_SECRET=${jwt_secret}" >> .env
        fi
        log "INFO" "Generated new JWT secret"
    fi

    # Update CORS_ORIGIN if it's wildcard
    if grep -q "CORS_ORIGIN=\*" .env; then
        log "WARN" "CORS_ORIGIN is set to '*'. Consider updating to your domain for production"
    fi

    log "INFO" "Environment configuration completed"
}

# Database operations
manage_database() {
    local action="$1"
    case "$action" in
        "check")
            log "INFO" "Checking database health..."
            if docker ps --filter "name=recipes_db" --filter "status=running" | grep -q recipes_db; then
                log "INFO" "Database container is running"
                # Test connection
                if docker exec recipes_db pg_isready -U recipes >/dev/null 2>&1; then
                    log "INFO" "Database is healthy and accepting connections"
                    return 0
                else
                    log "WARN" "Database container running but not accepting connections"
                    return 1
                fi
            else
                log "WARN" "Database container not running"
                return 1
            fi
            ;;
        "init")
            log "INFO" "Initializing database..."
            # Wait for database to be ready
            local attempts=0
            while [[ $attempts -lt 30 ]]; do
                if docker exec recipes_db pg_isready -U recipes >/dev/null 2>&1; then
                    log "INFO" "Database ready"
                    break
                fi
                log "DEBUG" "Waiting for database... (attempt $((attempts + 1))/30)"
                sleep 2
                ((attempts++))
            done
            
            if [[ $attempts -eq 30 ]]; then
                error_exit "Database failed to become ready"
            fi
            ;;
        "grant_admin")
            log "INFO" "Granting admin privileges..."
            if [[ -f grant_admin_privileges.sql ]]; then
                docker exec -i recipes_db psql -U recipes -d recipes < grant_admin_privileges.sql
                log "INFO" "Admin privileges granted successfully"
            else
                log "ERROR" "grant_admin_privileges.sql not found"
                return 1
            fi
            ;;
        "optimize")
            log "INFO" "Applying database optimizations..."
            if [[ -f database_optimizations_advanced.sql ]]; then
                docker exec -i recipes_db psql -U recipes -d recipes < database_optimizations_advanced.sql
                log "INFO" "Database optimizations applied"
            else
                log "WARN" "database_optimizations_advanced.sql not found"
            fi
            ;;
    esac
}

# Service management
manage_services() {
    local action="$1"
    case "$action" in
        "start")
            log "INFO" "Starting all services..."
            
            # Create required directories
            mkdir -p nginx/static/images
            
            # Start services with Docker Compose
            docker compose up -d --build
            
            # Wait for services to be ready
            sleep 10
            
            # Initialize database
            manage_database "init"
            manage_database "grant_admin"
            manage_database "optimize"
            
            log "INFO" "All services started successfully"
            ;;
        "stop")
            log "INFO" "Stopping all services..."
            docker compose down
            log "INFO" "All services stopped"
            ;;
        "restart")
            log "INFO" "Restarting all services..."
            manage_services "stop"
            sleep 5
            manage_services "start"
            ;;
        "status")
            show_service_status
            ;;
        "logs")
            local service="${2:-all}"
            if [[ "$service" == "all" ]]; then
                docker compose logs -f
            else
                docker compose logs -f "$service"
            fi
            ;;
    esac
}

# Show service status
show_service_status() {
    log "INFO" "Service Status Report"
    echo "===================="
    
    # Check Docker containers
    local services=("recipes_db" "recipes_api" "recipes_scrapers" "recipes_admin_web" "recipes_public_web" "recipes_static")
    
    for service in "${services[@]}"; do
        if docker ps --filter "name=$service" --filter "status=running" | grep -q "$service"; then
            echo -e "${GREEN}✓${NC} $service: Running"
        else
            echo -e "${RED}✗${NC} $service: Not running"
        fi
    done
    
    echo "===================="
    
    # Health checks
    log "INFO" "Performing health checks..."
    
    # Database health
    if manage_database "check" >/dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} Database: Healthy"
    else
        echo -e "${RED}✗${NC} Database: Unhealthy"
    fi
    
    # API health
    if curl -s --max-time 5 "http://localhost:3000/api/health" >/dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} API: Responding"
    else
        echo -e "${RED}✗${NC} API: Not responding"
    fi
    
    # Web services
    if curl -s --max-time 5 "http://localhost:80" >/dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} Public Web: Accessible"
    else
        echo -e "${RED}✗${NC} Public Web: Not accessible"
    fi
    
    if curl -s --max-time 5 "http://localhost:5173" >/dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} Admin Web: Accessible"
    else
        echo -e "${RED}✗${NC} Admin Web: Not accessible"
    fi
    
    echo "===================="
    
    # Show connection URLs
    local host="localhost"
    log "INFO" "Service URLs:"
    echo "  - Public Web:  http://$host/"
    echo "  - API:         http://$host:3000"
    echo "  - Admin Web:   http://$host:5173"
    echo "  - Static imgs: http://$host:8080/images/"
}

# Continuous monitoring
monitor_services() {
    log "INFO" "Starting continuous service monitoring..."
    log "INFO" "Press Ctrl+C to stop monitoring"
    
    while true; do
        clear
        echo "=== Food Application Service Monitor ==="
        echo "Last updated: $(date)"
        echo ""
        show_service_status
        echo ""
        echo "Monitoring... (Press Ctrl+C to exit)"
        sleep 30
    done
}

# Cleanup and maintenance
cleanup() {
    log "INFO" "Performing cleanup..."
    
    # Remove stopped containers
    docker container prune -f
    
    # Remove unused images
    docker image prune -f
    
    # Remove unused volumes (be careful with this)
    # docker volume prune -f
    
    log "INFO" "Cleanup completed"
}

# Backup database
backup_database() {
    local backup_dir="/tmp/food_app_backups"
    mkdir -p "$backup_dir"
    local backup_file="$backup_dir/recipes_backup_$(date +%Y%m%d_%H%M%S).sql"
    
    log "INFO" "Creating database backup: $backup_file"
    docker exec recipes_db pg_dump -U recipes recipes > "$backup_file"
    log "INFO" "Database backup created successfully"
}

# Debug information
debug_info() {
    log "INFO" "Collecting debug information..."
    echo "=== System Information ==="
    echo "Date: $(date)"
    echo "User: $(whoami)"
    echo "Working Directory: $(pwd)"
    echo "Docker Version: $(docker --version)"
    echo "Docker Compose Version: $(docker compose version)"
    echo "Node Version: $(node --version 2>/dev/null || echo 'Not installed')"
    echo "npm Version: $(npm --version 2>/dev/null || echo 'Not installed')"
    echo ""
    echo "=== Environment Variables ==="
    if [[ -f .env ]]; then
        echo "Environment file exists"
        grep -E "^[A-Z_]+=.*" .env | sed 's/=.*/=***/' || true
    else
        echo "No .env file found"
    fi
    echo ""
    echo "=== Docker Containers ==="
    docker ps -a
    echo ""
    echo "=== Docker Images ==="
    docker images
    echo ""
    echo "=== Recent Logs ==="
    tail -n 20 "$LOG_FILE" 2>/dev/null || echo "No logs available"
}

# Show help
show_help() {
    cat << EOF
Food Application Universal Service Manager

Usage: $0 [COMMAND] [OPTIONS]

Commands:
  start               Start all services
  stop                Stop all services  
  restart             Restart all services
  status              Show service status
  monitor             Continuous monitoring (Ctrl+C to exit)
  logs [service]      Show logs (all services or specific service)
  
  db-check            Check database health
  db-init             Initialize database
  db-grant-admin      Grant admin privileges
  db-optimize         Apply database optimizations
  db-backup           Create database backup
  
  setup               Setup environment and dependencies
  cleanup             Clean up unused Docker resources
  debug               Show debug information
  
  help                Show this help message

Examples:
  $0 setup            # First time setup
  $0 start            # Start all services
  $0 status           # Check service status
  $0 monitor          # Continuous monitoring
  $0 logs api         # Show API logs
  $0 db-backup        # Backup database

EOF
}

# Main function
main() {
    local command="${1:-help}"
    
    # Initialize logging
    echo "=== Food Application Service Manager Started at $(date) ===" >> "$LOG_FILE"
    
    case "$command" in
        "start")
            check_root
            install_dependencies
            setup_env
            manage_services "start"
            show_service_status
            ;;
        "stop")
            manage_services "stop"
            ;;
        "restart")
            manage_services "restart"
            show_service_status
            ;;
        "status")
            show_service_status
            ;;
        "monitor")
            monitor_services
            ;;
        "logs")
            manage_services "logs" "${2:-all}"
            ;;
        "db-check")
            manage_database "check"
            ;;
        "db-init")
            manage_database "init"
            ;;
        "db-grant-admin")
            manage_database "grant_admin"
            ;;
        "db-optimize")
            manage_database "optimize"
            ;;
        "db-backup")
            backup_database
            ;;
        "setup")
            check_root
            install_dependencies
            setup_env
            log "INFO" "Setup completed. Run '$0 start' to start services."
            ;;
        "cleanup")
            cleanup
            ;;
        "debug")
            debug_info
            ;;
        "help"|"--help"|"-h")
            show_help
            ;;
        *)
            log "ERROR" "Unknown command: $command"
            show_help
            exit 1
            ;;
    esac
}

# Trap to handle interrupts
trap 'log "INFO" "Service manager interrupted"; exit 0' INT TERM

# Run main function
main "$@"