# Food Application - Quick Start Guide

## Issues Fixed

1. ✅ **CORS_ORIGIN configuration** - Updated in `.env` for proper admin access
2. ✅ **SQL script execution** - Created proper `run_sql.sh` script
3. ✅ **Universal service management** - Created comprehensive management scripts
4. ✅ **Missing recipes issue** - Created fix script with sample data
5. ✅ **Authentication issues** - Admin privileges script included

## Quick Commands

### 1. Start the Application
```bash
chmod +x start_food_app.sh
sudo ./start_food_app.sh
```

### 2. Fix Missing Recipes
```bash
chmod +x fix_missing_recipes.sh
sudo ./fix_missing_recipes.sh
```

### 3. Grant Admin Privileges
```bash
chmod +x run_sql.sh
sudo ./run_sql.sh grant_admin_privileges.sql
```

### 4. Monitor Services
```bash
chmod +x monitor_services.sh
./monitor_services.sh
```

### 5. Diagnose Issues
```bash
chmod +x diagnose_issues.sh
./diagnose_issues.sh
```

## Service URLs

- **Public Web**: http://localhost/
- **API**: http://localhost:3000
- **Admin Web**: http://localhost:5173
- **Static Images**: http://localhost:8080/images/

## Common Commands

```bash
# Start all services
sudo ./start_food_app.sh

# Stop all services
sudo docker compose down

# View logs
sudo docker compose logs -f

# Restart specific service
sudo docker compose restart recipes_api

# Check service status
sudo docker ps
```

## Troubleshooting

### If Docker permission issues:
```bash
sudo usermod -aG docker $USER
newgrp docker
```

### If database is empty:
```bash
sudo ./fix_missing_recipes.sh
```

### If admin access doesn't work:
```bash
sudo ./run_sql.sh grant_admin_privileges.sql
```

### If services won't start:
```bash
sudo systemctl start docker
sudo docker compose down
sudo docker compose up -d --build
```

## Files Created/Updated

- `start_food_app.sh` - Main startup script
- `monitor_services.sh` - Service monitoring
- `fix_missing_recipes.sh` - Fixes missing recipes
- `diagnose_issues.sh` - Diagnostic tool
- `run_sql.sh` - Proper SQL execution
- `universal_service_manager.sh` - Advanced service management
- `.env` - Fixed CORS and added missing variables

## Admin User

The admin privileges will be granted to: `emalinovskis@me.com`

Make sure this user is registered in the system before granting admin privileges.

## Notes

- All services run in Docker containers
- Database data is persisted in Docker volumes
- Images are stored in `nginx/static/images/`
- The application includes PostgreSQL, API, Web interfaces, and static file serving
- PWA functionality has been maintained in the frontend code