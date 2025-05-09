#!/bin/sh
#File backup.sh

# Trap SIGINT (Control-C) and ensure postgresql service is stopped
trap 'echo "Interrupted. Stopping postgresql service"; brew services stop postgresql@15; exit 130' INT

# Load environment variables from .env file
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
    if [ -z "$DATABASE_URL" ]; then
        echo "DATABASE_URL is not set in .env file"
        exit 2
    fi
else
    echo "No .env file found"
    exit 1
fi

DATABASE_URL=$DATABASE_URL

# Check if postgresql service is already running
if brew services list | grep -q "postgresql@15.*started"; then
    echo "Postgresql service is already running"
else
    # Start postgresql service
    echo "Starting postgresql service"
    brew services start postgresql@15
fi

# Backup the database
echo "Backing up database"
pg_dump -v -d $DATABASE_URL --data-only --format=plain -f ./backups/backup.sql

# Stop postgresql service
echo "Stopping postgresql service"
brew services stop postgresql@15
