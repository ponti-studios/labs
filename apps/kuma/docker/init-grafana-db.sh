#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE USER grafana_user WITH PASSWORD '${GRAFANA_DB_PASSWORD:-grafana_password_change_me}';
    CREATE DATABASE grafana OWNER grafana_user;
    GRANT ALL PRIVILEGES ON DATABASE grafana TO grafana_user;
EOSQL

echo "Grafana database and user created successfully"
