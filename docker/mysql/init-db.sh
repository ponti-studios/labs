#!/bin/bash
set -e

echo "==> Initializing MySQL database..."

mysql -v -u root --password="${MYSQL_ROOT_PASSWORD}" <<-'EOSQL'
  CREATE DATABASE IF NOT EXISTS labs;
  USE labs;

  -- Set default charset
  ALTER DATABASE labs CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EOSQL

echo "==> Database initialized successfully"
