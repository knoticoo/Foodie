#!/usr/bin/env bash
set -euo pipefail

# Script to properly execute SQL files against the database
# Usage: ./run_sql.sh <sql_file>

SQL_FILE="${1:-grant_admin_privileges.sql}"

if [[ ! -f "$SQL_FILE" ]]; then
    echo "Error: SQL file '$SQL_FILE' not found"
    exit 1
fi

echo "Executing SQL file: $SQL_FILE"

# Check if database container is running
if ! docker ps --filter "name=recipes_db" --filter "status=running" | grep -q recipes_db; then
    echo "Error: Database container 'recipes_db' is not running"
    echo "Please start the services first using: ./universal_service_manager.sh start"
    exit 1
fi

# Execute the SQL file
docker exec -i recipes_db psql -U recipes -d recipes < "$SQL_FILE"

echo "SQL file executed successfully"