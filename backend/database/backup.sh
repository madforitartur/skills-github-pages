#!/usr/bin/env bash
set -euo pipefail

DB_NAME=${DB_NAME:-encomendas_db}
DB_USER=${DB_USER:-postgres}
BACKUP_DIR=${BACKUP_DIR:-/tmp/db_backups}
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

mkdir -p "$BACKUP_DIR"

pg_dump -U "$DB_USER" -d "$DB_NAME" -F c -f "$BACKUP_DIR/${DB_NAME}_${TIMESTAMP}.dump"

echo "Backup saved to $BACKUP_DIR/${DB_NAME}_${TIMESTAMP}.dump"
