#!/bin/bash
# SQLite to PostgreSQL Migration Script
# Description: Migrate CLI SQLite data to existing PostgreSQL tables
# Usage: ./migrate_sqlite_to_postgres.sh [dry-run|execute]
# 
# This script is idempotent - can be run multiple times safely
# Handles: accounts, transactions, categories, tasks, events, notes, health, trips

set -euo pipefail

# Configuration (can be overridden via environment)
SQLITE_DB="${SQLITE_DB:-$HOME/.config/kuma
PG_HOST="${PG_HOST:-localhost}"
PG_PORT="${PG_PORT:-5432}"
PG_USER="${PG_USER:-postgres}"
PG_PASSWORD="${PG_PASSWORD:-postgres}"
PG_DB="${PG_DB:-hominem}"
PG_URL="postgres://$PG_USER:$PG_PASSWORD@$PG_HOST:$PG_PORT/$PG_DB"
PSQL_OPTIONS=("-q" "-v" "ON_ERROR_STOP=1")
run_psql() {
    psql "$PG_URL" "${PSQL_OPTIONS[@]}" "$@"
}

# Get user ID from args or environment
USER_ID="${HOMINEM_USER_ID:-}"

usage() {
    echo "Usage: $0 [execute|dry-run] [USER_ID]"
    echo ""
    echo "Environment variables:"
    echo "  SQLITE_DB      - Path to SQLite database (default: ~/.config/kuma
    echo "  PG_HOST        - PostgreSQL host (default: localhost)"
    echo "  PG_PORT        - PostgreSQL port (default: 5432)"
    echo "  PG_USER        - PostgreSQL user (default: postgres)"
    echo "  PG_DB          - PostgreSQL database (default: hominem)"
    echo "  HOMINEM_USER_ID - User UUID for migrated data"
    echo ""
    echo "Example:"
    echo "  HOMINEM_USER_ID=ec039371-e5e5-47f4-b34a-af09c56d39c5 $0 execute"
}

log_info() { echo "[INFO] $*"; }
log_error() { echo "[ERROR] $*" >&2; }
log_warn() { echo "[WARN] $*" >&2; }

# Check prerequisites
check_prerequisites() {
    if [ ! -f "$SQLITE_DB" ]; then
        log_error "SQLite database not found: $SQLITE_DB"
        exit 1
    fi
    
    if ! command -v sqlite3 >/dev/null 2>&1; then
        log_error "sqlite3 command not found"
        exit 1
    fi
    
    # Check PostgreSQL connection
    if ! run_psql -c "SELECT 1" >/dev/null 2>&1; then
        log_error "Cannot connect to PostgreSQL: $PG_URL"
        exit 1
    fi
}

# Get or validate user ID
get_user_id() {
    if [ -n "$USER_ID" ]; then
        # Validate UUID format
        if ! [[ "$USER_ID" =~ ^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$ ]]; then
            log_error "Invalid UUID format: $USER_ID"
            exit 1
        fi
        return
    fi
    
    # Try to get from PostgreSQL users table
    USER_ID=$(run_psql -t -c "SELECT id FROM users LIMIT 1" 2>/dev/null | tr -d ' \n')
    
    if [ -z "$USER_ID" ]; then
        log_error "No user ID provided and no users exist in database"
        log_error "Provide HOMINEM_USER_ID environment variable"
        exit 1
    fi
    
    log_info "Using user ID: $USER_ID"
}

# Migrate financial accounts (idempotent)
migrate_accounts() {
    log_info "Migrating financial accounts..."
    
    # Get existing accounts to avoid duplicates
    local existing=$(run_psql -t -c "SELECT COUNT(*) FROM finance_accounts" | tr -d ' ')
    
    # Only migrate if no accounts exist (idempotent)
    if [ "$existing" -gt 0 ]; then
        log_info "Accounts already exist ($existing), skipping migration"
        return
    fi
    
    local count=$(sqlite3 "$SQLITE_DB" "SELECT COUNT(*) FROM financial_accounts" 2>/dev/null || echo "0")
    log_info "Found $count accounts in SQLite"
    
    [ "$count" -eq "0" ] && return
    
    local migrated=0
    local failed=0
    
    while IFS='|' read -r name type credit_limit; do
        [ -z "$name" ] && continue
        
        # Map type to valid enum
        case "${type:-checking}" in
            CHECKING) type="checking" ;;
            SAVINGS) type="savings" ;;
            CREDIT) type="credit" ;;
            INVESTMENT|INVESTMENTS) type="investment" ;;
            CASH) type="other" ;;
            STUDENT_LOAN) type="loan" ;;
            *) type="checking" ;;
        esac
        
        # Insert with error handling
        if run_psql -c "
            INSERT INTO finance_accounts (id, name, type, balance, \"limit\", iso_currency_code, user_id, created_at, updated_at)
            VALUES (uuid_generate_v4(), '$name', '$type', 0, ${credit_limit:-0}, 'USD', '$USER_ID'::uuid, now(), now())
        " 2>/dev/null; then
            ((migrated++))
        else
            ((failed++))
        fi
    done < <(sqlite3 -separator '|' "$SQLITE_DB" "SELECT name, COALESCE(type,'checking'), COALESCE(credit_limit,0) FROM financial_accounts" 2>/dev/null)
    
    log_info "Migrated $migrated accounts ($failed failed)"
}

# Migrate transactions (idempotent)
migrate_transactions() {
    log_info "Migrating transactions..."
    
    # Get existing count
    local existing=$(run_psql -t -c "SELECT COUNT(*) FROM transactions" | tr -d ' ')
    
    if [ "$existing" -gt 0 ]; then
        log_info "Transactions already exist ($existing), skipping migration"
        return
    fi
    
    # Get account UUID
    local account_id=$(run_psql -t -c "SELECT id FROM finance_accounts LIMIT 1" | tr -d ' 
')
    
    if [ -z "$account_id" ]; then
        log_error "No account found, cannot migrate transactions"
        return
    fi
    
    local count=$(sqlite3 "$SQLITE_DB" "SELECT COUNT(*) FROM finance_transactions" 2>/dev/null || echo "0")
    log_info "Found $count transactions in SQLite"
    
    [ "$count" -eq "0" ] && return
    
    log_info "Copying transactions into temporary staging..."
    run_psql -c "DROP TABLE IF EXISTS staging_transactions;"
    run_psql -c "CREATE TABLE staging_transactions (date TEXT, amount NUMERIC, description TEXT, category TEXT, type TEXT, note TEXT);"

    sqlite3 "$SQLITE_DB" <<SQL | run_psql -c "COPY staging_transactions (date, amount, description, category, type, note) FROM STDIN WITH (FORMAT csv)"
.headers off
.mode csv
SELECT date,
       COALESCE(amount, 0),
       REPLACE(REPLACE(COALESCE(name,''), CHAR(13), ' '), CHAR(10), ' '),
       COALESCE(NULLIF(TRIM(category), ''), 'Uncategorized'),
       CASE
           WHEN UPPER(TRIM(COALESCE(type,''))) = 'INCOME' THEN 'income'
           WHEN UPPER(TRIM(COALESCE(type,''))) = 'REGULAR' THEN 'expense'
           WHEN UPPER(TRIM(COALESCE(type,''))) LIKE '%TRANSFER%' THEN 'transfer'
           ELSE 'expense'
       END,
       REPLACE(REPLACE(COALESCE(note,''), CHAR(13), ' '), CHAR(10), ' ')
FROM finance_transactions
WHERE date IS NOT NULL AND TRIM(date) <> '' AND date GLOB '????-??-??';
SQL

    local staging_count=$(run_psql -t -c "SELECT COUNT(*) FROM staging_transactions" | tr -d ' ')
    if [ "$staging_count" -gt 0 ]; then
        log_info "Loading $staging_count transactions into Postgres..."
        run_psql -c "INSERT INTO transactions (id, date, amount, description, category, type, note, account_id, user_id, created_at)
            SELECT uuid_generate_v4(), date::timestamp, amount, description, category, type::transaction_type, note, '$account_id'::uuid, '$USER_ID'::uuid, now()
            FROM staging_transactions;"
    else
        log_info "No valid transactions exported to staging (0 rows)"
    fi
    run_psql -c "DROP TABLE staging_transactions;"
}

# Migrate categories
migrate_categories() {
    log_info "Migrating categories..."
    
    local existing=$(run_psql -t -c "SELECT COUNT(*) FROM categories" | tr -d ' ')
    
    if [ "$existing" -gt 0 ]; then
        log_info "Categories already exist ($existing), skipping"
        return
    fi
    
    local count=$(sqlite3 "$SQLITE_DB" "SELECT COUNT(*) FROM categories" 2>/dev/null || echo "0")
    [ "$count" -eq "0" ] && return
    
    local migrated=0
    while IFS='|' read -r name domain; do
        [ -z "$name" ] && continue
        if run_psql -c "
            INSERT INTO categories (id, name, domain, user_id, created_at)
            VALUES (uuid_generate_v4(), '$name', '$domain', '$USER_ID'::uuid, now())
        " 2>/dev/null; then
            ((migrated++))
        fi
    done < <(sqlite3 -separator '|' "$SQLITE_DB" "SELECT name, COALESCE(domain,'finance') FROM categories" 2>/dev/null)
    
    log_info "Migrated $migrated categories"
}

# Migrate tasks
migrate_tasks() {
    log_info "Migrating tasks..."

    local existing=$(run_psql -t -c "SELECT COUNT(*) FROM tasks" | tr -d ' ')
    if [ "$existing" -gt 0 ]; then
        log_info "Tasks already exist ($existing), skipping"
        return
    fi

    local count=$(sqlite3 "$SQLITE_DB" "SELECT COUNT(*) FROM tasks" 2>/dev/null || echo "0")
    log_info "Found $count tasks in SQLite"
    [ "$count" -eq "0" ] && return

    local migrated=0
    local failed=0

    while IFS='|' read -r title description status priority due_date created_date completed_date; do
        [ -z "$title" ] && continue

        title="${title//\'/\'\'}"
        description="${description//\'/\'\'}"
        status="${status:-pending}"

        local priority_val="${priority:-0}"
        local due_sql="NULL"
        local created_sql="now()"
        local completed_sql="NULL"
        local updated_sql="now()"

        if [ -n "$due_date" ]; then
            due_date="${due_date//\'/\'\'}"
            due_sql="'$due_date'"
        fi
        if [ -n "$created_date" ]; then
            created_date="${created_date//\'/\'\'}"
            created_sql="'$created_date'"
            updated_sql="'$created_date'"
        fi
        if [ -n "$completed_date" ]; then
            completed_date="${completed_date//\'/\'\'}"
            completed_sql="'$completed_date'"
            updated_sql="'$completed_date'"
        fi

        local desc_sql="NULL"
        if [ -n "$description" ]; then
            desc_sql="'$description'"
        fi

        if run_psql -c "
            INSERT INTO tasks (id, title, description, status, priority, due_date, completed_at, user_id, created_at, updated_at)
            VALUES (uuid_generate_v4(), '$title', $desc_sql, '$status', $priority_val, $due_sql, $completed_sql, '$USER_ID'::uuid, $created_sql, $updated_sql)
        " 2>/dev/null; then
            ((migrated++))
        else
            ((failed++))
        fi
    done < <(sqlite3 -separator '|' "$SQLITE_DB" "SELECT title, COALESCE(description,''), COALESCE(status,'pending'), COALESCE(priority,0), COALESCE(due_date,''), COALESCE(created_date,''), COALESCE(completed_date,'') FROM tasks" 2>/dev/null)

    log_info "Migrated $migrated tasks ($failed failed)"
}

# Migrate calendar events -> events
migrate_events() {
    log_info "Migrating calendar events..."

    local existing=$(run_psql -t -c "SELECT COUNT(*) FROM events" | tr -d ' ')
    if [ "$existing" -gt 0 ]; then
        log_info "Events already exist ($existing), skipping"
        return
    fi

    local count=$(sqlite3 "$SQLITE_DB" "SELECT COUNT(*) FROM calendar_events" 2>/dev/null || echo "0")
    log_info "Found $count calendar events in SQLite"
    [ "$count" -eq "0" ] && return

    local migrated=0
    local failed=0

    while IFS='|' read -r start_time end_time summary description location created last_modified; do
        [ -z "$start_time" ] && continue

        summary="${summary//\'/\'\'}"
        description="${description//\'/\'\'}"
        location="${location//\'/\'\'}"

        local start_sql="'$start_time'"
        local end_sql="NULL"
        local all_day="false"

        if [[ "$start_time" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}$ ]]; then
            all_day="true"
            start_sql="'$start_time 00:00:00'"
        fi
        if [ -n "$end_time" ]; then
            end_time="${end_time//\'/\'\'}"
            end_sql="'$end_time'"
        fi

        local created_sql="now()"
        local updated_sql="now()"
        if [ -n "$created" ]; then
            created="${created//\'/\'\'}"
            created_sql="'$created'"
            updated_sql="'$created'"
        fi
        if [ -n "$last_modified" ]; then
            last_modified="${last_modified//\'/\'\'}"
            updated_sql="'$last_modified'"
        fi

        local desc_sql="NULL"
        local loc_sql="NULL"
        if [ -n "$description" ]; then
            desc_sql="'$description'"
        fi
        if [ -n "$location" ]; then
            loc_sql="'$location'"
        fi

        if run_psql -c "
            INSERT INTO events (id, title, description, start_time, end_time, all_day, location, user_id, created_at, updated_at)
            VALUES (uuid_generate_v4(), '$summary', $desc_sql, $start_sql, $end_sql, $all_day, $loc_sql, '$USER_ID'::uuid, $created_sql, $updated_sql)
        " 2>/dev/null; then
            ((migrated++))
        else
            ((failed++))
        fi
    done < <(sqlite3 -separator '|' "$SQLITE_DB" "SELECT COALESCE(start,''), COALESCE(end,''), COALESCE(summary,'Untitled'), COALESCE(description,''), COALESCE(location,''), COALESCE(created,''), COALESCE(last_modified,'') FROM calendar_events" 2>/dev/null)

    log_info "Migrated $migrated events ($failed failed)"
}

# Migrate notes
migrate_notes() {
    log_info "Migrating notes..."

    local existing=$(run_psql -t -c "SELECT COUNT(*) FROM notes" | tr -d ' ')
    if [ "$existing" -gt 0 ]; then
        log_info "Notes already exist ($existing), skipping"
        return
    fi

    local count=$(sqlite3 "$SQLITE_DB" "SELECT COUNT(*) FROM notes" 2>/dev/null || echo "0")
    log_info "Found $count notes in SQLite"
    [ "$count" -eq "0" ] && return

    local migrated=0
    local failed=0

    while IFS='|' read -r file_path text section tags created_at updated_at; do
        local title="${section:-$file_path}"
        title="${title//\'/\'\'}"
        text="${text//\'/\'\'}"
        tags="${tags//\'/\'\'}"
        local file_path_esc="${file_path//\'/\'\'}"
        local section_esc="${section//\'/\'\'}"

        local meta=""
        if [ -n "$file_path_esc" ] || [ -n "$section_esc" ] || [ -n "$tags" ]; then
            meta="\\n\\n---\\nmeta: {\"file_path\":\"$file_path_esc\",\"section\":\"$section_esc\",\"tags\":\"$tags\"}"
        fi

        local created_sql="now()"
        local updated_sql="now()"
        if [[ "$created_at" =~ ^[0-9]+$ ]]; then
            created_sql="to_timestamp($created_at)"
            updated_sql="$created_sql"
        fi
        if [[ "$updated_at" =~ ^[0-9]+$ ]]; then
            updated_sql="to_timestamp($updated_at)"
        fi

        if run_psql -c "
            INSERT INTO notes (id, title, content, \"userId\", created_at, updated_at)
            VALUES (uuid_generate_v4(), '$title', '${text}${meta}', '$USER_ID'::uuid, $created_sql, $updated_sql)
        " 2>/dev/null; then
            ((migrated++))
        else
            ((failed++))
        fi
    done < <(sqlite3 -separator '|' "$SQLITE_DB" "SELECT COALESCE(file_path,''), COALESCE(text,''), COALESCE(section,''), COALESCE(tags,''), COALESCE(created_at,''), COALESCE(updated_at,'') FROM notes" 2>/dev/null)

    log_info "Migrated $migrated notes ($failed failed)"
}

# Copy helper for health
copy_health_records() {
    local label="$1"
    local sql="$2"

    log_info "Importing health/$label..."
    sqlite3 "$SQLITE_DB" <<SQL | run_psql -c "COPY health (type, data, recorded_at, user_id) FROM STDIN WITH (FORMAT csv)"
.headers off
.mode csv
$sql
SQL
    log_info "Copied health/$label"
}

# Migrate health tables into health (JSONB)
migrate_health() {
    log_info "Migrating health data..."

    local existing=$(run_psql -t -c "SELECT COUNT(*) FROM health" | tr -d ' ')
    if [ "$existing" -gt 0 ]; then
        log_info "Health records already exist ($existing), skipping"
        return
    fi

    local user_literal="'$USER_ID'"

    local bp_sql
    bp_sql="SELECT 'blood_pressure', json_object(
        'heart_rate', COALESCE(heart_rate,0),
        'systolic', COALESCE(systolic,0),
        'diastolic', COALESCE(diastolic,0),
        'comments', REPLACE(REPLACE(COALESCE(comments,''), CHAR(10), ' '), CHAR(13), ' '),
        'source', REPLACE(REPLACE(COALESCE(source,''), CHAR(10), ' '), CHAR(13), ' ')
    ), timestamp, $user_literal
    FROM health_blood_pressure
    WHERE timestamp IS NOT NULL AND TRIM(timestamp) <> '';"

    local hr_sql
    hr_sql="SELECT 'heart_rate', json_object(
        'duration_seconds', COALESCE(duration_seconds,0),
        'bpm_value', COALESCE(bpm_value,0),
        'source', REPLACE(REPLACE(COALESCE(source,''), CHAR(10), ' '), CHAR(13), ' ')
    ), timestamp, $user_literal
    FROM health_heart_rate
    WHERE timestamp IS NOT NULL AND TRIM(timestamp) <> '';"

    local sleep_sql
    sleep_sql="SELECT 'sleep', json_object(
        'end_time', COALESCE(end_time,''),
        'light_sleep_seconds', COALESCE(light_sleep_seconds,0),
        'deep_sleep_seconds', COALESCE(deep_sleep_seconds,0),
        'rem_sleep_seconds', COALESCE(rem_sleep_seconds,0),
        'awake_seconds', COALESCE(awake_seconds,0),
        'wake_up_count', COALESCE(wake_up_count,0),
        'duration_to_sleep_seconds', COALESCE(duration_to_sleep_seconds,0),
        'duration_to_wake_seconds', COALESCE(duration_to_wake_seconds,0),
        'snoring_seconds', COALESCE(snoring_seconds,0),
        'snoring_episodes', COALESCE(snoring_episodes,0),
        'avg_heart_rate', COALESCE(avg_heart_rate,0),
        'min_heart_rate', COALESCE(min_heart_rate,0),
        'max_heart_rate', COALESCE(max_heart_rate,0),
        'source', REPLACE(REPLACE(COALESCE(source,''), CHAR(10), ' '), CHAR(13), ' ')
    ), start_time, $user_literal
    FROM health_sleep
    WHERE start_time IS NOT NULL AND TRIM(start_time) <> '';"

    local weight_sql
    weight_sql="SELECT 'weight', json_object(
        'weight_lb', COALESCE(weight_lb,0),
        'fat_mass_lb', COALESCE(fat_mass_lb,0),
        'bone_mass_lb', COALESCE(bone_mass_lb,0),
        'muscle_mass_lb', COALESCE(muscle_mass_lb,0),
        'hydration_lb', COALESCE(hydration_lb,0),
        'comments', REPLACE(REPLACE(COALESCE(comments,''), CHAR(10), ' '), CHAR(13), ' '),
        'source', REPLACE(REPLACE(COALESCE(source,''), CHAR(10), ' '), CHAR(13), ' ')
    ), timestamp, $user_literal
    FROM health_weight
    WHERE timestamp IS NOT NULL AND TRIM(timestamp) <> '';"

    local unified_sql
    unified_sql="SELECT COALESCE(NULLIF(TRIM(metric_type), ''), 'health_metric'), json_object(
        'platform', REPLACE(REPLACE(COALESCE(platform,''), CHAR(10), ' '), CHAR(13), ' '),
        'metric_type', COALESCE(metric_type,''),
        'value', COALESCE(value,0),
        'unit', COALESCE(unit,''),
        'source_file', REPLACE(REPLACE(COALESCE(source_file,''), CHAR(10), ' '), CHAR(13), ' ')
    ), timestamp, $user_literal
    FROM unified_health_log
    WHERE timestamp IS NOT NULL AND TRIM(timestamp) <> '';"

    copy_health_records "blood_pressure" "$bp_sql"
    copy_health_records "heart_rate" "$hr_sql"
    copy_health_records "sleep" "$sleep_sql"
    copy_health_records "weight" "$weight_sql"
    copy_health_records "unified" "$unified_sql"
}

# Migrate trips
migrate_trips() {
    log_info "Migrating trips..."

    local existing=$(run_psql -t -c "SELECT COUNT(*) FROM trips" | tr -d ' ')
    if [ "$existing" -gt 0 ]; then
        log_info "Trips already exist ($existing), skipping"
        return
    fi

    local count=$(sqlite3 "$SQLITE_DB" "SELECT COUNT(*) FROM trips" 2>/dev/null || echo "0")
    log_info "Found $count trips in SQLite"
    [ "$count" -eq "0" ] && return

    local migrated=0
    local failed=0

    while IFS='|' read -r start_date end_date city state country people travel_details price num_of_travelers; do
        local name="${city:-Trip}"
        local destination=""
        [ -n "$city" ] && destination="$city"
        [ -n "$state" ] && destination="${destination}${destination:+, }$state"
        [ -n "$country" ] && destination="${destination}${destination:+, }$country"

        local meta=""
        if [ -n "$people" ] || [ -n "$travel_details" ] || [ -n "$price" ] || [ -n "$num_of_travelers" ]; then
            meta=" | people=$people | details=$travel_details | price=$price | travelers=$num_of_travelers"
        fi

        name="${name//\'/\'\'}"
        destination="${destination//\'/\'\'}"
        meta="${meta//\'/\'\'}"

        local start_sql="NULL"
        local end_sql="NULL"
        if [ -n "$start_date" ]; then
            start_date="${start_date//\'/\'\'}"
            start_sql="'$start_date'"
        fi
        if [ -n "$end_date" ]; then
            end_date="${end_date//\'/\'\'}"
            end_sql="'$end_date'"
        fi

        if run_psql -c "
            INSERT INTO trips (id, name, destination, start_date, end_date, status, user_id, created_at)
            VALUES (uuid_generate_v4(), '${name}${meta}', ${destination:+\'$destination\'}${destination:+'::text'}${destination:='NULL'}, $start_sql, $end_sql, 'planned', '$USER_ID'::uuid, now())
        " 2>/dev/null; then
            ((migrated++))
        else
            ((failed++))
        fi
    done < <(sqlite3 -separator '|' "$SQLITE_DB" "SELECT COALESCE(start_date,''), COALESCE(end_date,''), COALESCE(city,''), COALESCE(state,''), COALESCE(country,''), COALESCE(people,''), COALESCE(travel_details,''), COALESCE(price,''), COALESCE(num_of_travelers,'') FROM trips" 2>/dev/null)

    log_info "Migrated $migrated trips ($failed failed)"
}

# Verify migration
verify_migration() {
    log_info "Verifying migration..."
    
    local accounts=$(run_psql -t -c "SELECT COUNT(*) FROM finance_accounts" | tr -d ' ')
    local transactions=$(run_psql -t -c "SELECT COUNT(*) FROM transactions" | tr -d ' ')
    local tasks=$(run_psql -t -c "SELECT COUNT(*) FROM tasks" | tr -d ' ')
    local events=$(run_psql -t -c "SELECT COUNT(*) FROM events" | tr -d ' ')
    local notes=$(run_psql -t -c "SELECT COUNT(*) FROM notes" | tr -d ' ')
    local health=$(run_psql -t -c "SELECT COUNT(*) FROM health" | tr -d ' ')
    local trips=$(run_psql -t -c "SELECT COUNT(*) FROM trips" | tr -d ' ')
    
    log_info "PostgreSQL: $accounts accounts, $transactions transactions, $tasks tasks, $events events, $notes notes, $health health, $trips trips"
    
    if [ "$accounts" -gt 0 ] || [ "$transactions" -gt 0 ] || [ "$tasks" -gt 0 ] || [ "$events" -gt 0 ] || [ "$notes" -gt 0 ] || [ "$health" -gt 0 ] || [ "$trips" -gt 0 ]; then
        log_info "Migration successful!"
        return 0
    else
        log_error "Migration verification failed"
        return 1
    fi
}

# Dry run - show what would be migrated
dry_run() {
    log_info "=== Dry Run ==="
    log_info "SQLite: $SQLITE_DB"
    log_info "PostgreSQL: $PG_URL"
    log_info ""
    log_info "Would migrate:"
    log_info "  financial_accounts: $(sqlite3 "$SQLITE_DB" 'SELECT COUNT(*) FROM financial_accounts' 2>/dev/null || echo 0)"
    log_info "  finance_transactions: $(sqlite3 "$SQLITE_DB" 'SELECT COUNT(*) FROM finance_transactions' 2>/dev/null || echo 0)"
    log_info "  categories: $(sqlite3 "$SQLITE_DB" 'SELECT COUNT(*) FROM categories' 2>/dev/null || echo 0)"
    log_info "  tasks: $(sqlite3 "$SQLITE_DB" 'SELECT COUNT(*) FROM tasks' 2>/dev/null || echo 0)"
    log_info "  calendar_events: $(sqlite3 "$SQLITE_DB" 'SELECT COUNT(*) FROM calendar_events' 2>/dev/null || echo 0)"
    log_info "  notes: $(sqlite3 "$SQLITE_DB" 'SELECT COUNT(*) FROM notes' 2>/dev/null || echo 0)"
    log_info "  health_blood_pressure: $(sqlite3 "$SQLITE_DB" 'SELECT COUNT(*) FROM health_blood_pressure' 2>/dev/null || echo 0)"
    log_info "  health_heart_rate: $(sqlite3 "$SQLITE_DB" 'SELECT COUNT(*) FROM health_heart_rate' 2>/dev/null || echo 0)"
    log_info "  health_sleep: $(sqlite3 "$SQLITE_DB" 'SELECT COUNT(*) FROM health_sleep' 2>/dev/null || echo 0)"
    log_info "  health_weight: $(sqlite3 "$SQLITE_DB" 'SELECT COUNT(*) FROM health_weight' 2>/dev/null || echo 0)"
    log_info "  unified_health_log: $(sqlite3 "$SQLITE_DB" 'SELECT COUNT(*) FROM unified_health_log' 2>/dev/null || echo 0)"
    log_info "  trips: $(sqlite3 "$SQLITE_DB" 'SELECT COUNT(*) FROM trips' 2>/dev/null || echo 0)"
}

# Main
main() {
    local mode="${1:-dry-run}"
    
    if [ "$#" -ge 2 ]; then
        USER_ID="$2"
    fi
    
    if [ "$mode" = "-h" ] || [ "$mode" = "--help" ]; then
        usage
        exit 0
    fi
    
    log_info "=== SQLite to PostgreSQL Migration ==="
    
    check_prerequisites
    get_user_id
    
    if [ "$mode" = "dry-run" ]; then
        dry_run
    elif [ "$mode" = "execute" ]; then
        migrate_accounts
        migrate_transactions
        migrate_categories
        migrate_tasks
        migrate_events
        migrate_notes
        migrate_health
        migrate_trips
        verify_migration
    else
        log_error "Unknown mode: $mode"
        usage
        exit 1
    fi
}

main "$@"
