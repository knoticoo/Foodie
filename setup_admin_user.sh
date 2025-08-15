#!/bin/bash

# Script to grant admin privileges to a specific user
# This will connect to the PostgreSQL database and grant admin privileges

# Load environment variables if .env file exists
if [ -f .env ]; then
    source .env
fi

# Set default values if not provided in environment
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${POSTGRES_DB:-recipes}
DB_USER=${POSTGRES_USER:-postgres}
DB_PASSWORD=${POSTGRES_PASSWORD:-postgres}

echo "Connecting to database: $DB_NAME on $DB_HOST:$DB_PORT as $DB_USER"

# Check if user already exists and has admin privileges
echo "Checking current admin status for emalinovskis@me.com..."

PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "
SELECT email, is_admin, created_at 
FROM users 
WHERE email = 'emalinovskis@me.com';
"

echo ""
echo "Granting admin privileges to emalinovskis@me.com..."

# Execute the admin grant SQL
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f grant_admin_privileges.sql

echo ""
echo "Admin privileges have been granted!"
echo ""
echo "You can now:"
echo "1. Log in to the main site with emalinovskis@me.com / Millie1991"
echo "2. You should see an 'Admin Panel' link in the user menu"
echo "3. Click it to access the admin panel without needing an API key"
echo ""
echo "Note: Make sure the user account exists. If not, register first on the main site."