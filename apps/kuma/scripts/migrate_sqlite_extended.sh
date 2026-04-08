#!/bin/bash
# Extended SQLite to PostgreSQL Migration Script
# Description: Migrate additional data from SQLite to extended PostgreSQL tables
# Usage: ./migrate_sqlite_extended.sh [dry-run|execute]
# 
# This script is idempotent - can be run multiple times safely

set -euo pipefail

SQLITE_DB="${SQLITE_DB:-$HOME/.config/kuma
PG_HOST="${PG_HOST:-localhost}"
PG_PORT="${PG_PORT:-5432}"
PG_USER="${PG_USER:-postgres}"
PG_PASSWORD="${PG_PASSWORD:-postgres}"
PG_DB="${PG_DB:-hominem}"
PG_URL="postgres://$PG_USER:$PG_PASSWORD@$PG_HOST:$PG_PORT/$PG_DB"
PSQL_OPTIONS=("-q" "-v" "ON_ERROR_STOP=1")

USER_ID="${HOMINEM_USER_ID:-}"

run_psql() {
    psql "$PG_URL" "${PSQL_OPTIONS[@]}" "$@"
}

log_info() { echo "[INFO] $*"; }
log_error() { echo "[ERROR] $*" >&2; }

get_user_id() {
    if [ -n "$USER_ID" ]; then
        return
    fi
    USER_ID=$(run_psql -t -c "SELECT id FROM users LIMIT 1" 2>/dev/null | tr -d ' \n')
    [ -z "$USER_ID" ] && { log_error "No user ID"; exit 1; }
}

# Migrate credit_scores
migrate_credit_scores() {
    log_info "Migrating credit_scores..."
    local existing=$(run_psql -t -c "SELECT COUNT(*) FROM credit_scores" | tr -d ' ')
    if [ "$existing" -gt 0 ]; then
        log_info "Credit scores already exist ($existing), skipping"
        return
    fi
    
    local count=$(sqlite3 "$SQLITE_DB" "SELECT COUNT(*) FROM credit_scores" 2>/dev/null || echo "0")
    [ "$count" -eq "0" ] && return
    
    # SQLite columns: id, date, fico, vantage
    local migrated=0
    while IFS='|' read -r fico vantage; do
        [ -z "$fico" ] && continue
        if run_psql -c "
            INSERT INTO credit_scores (user_id, score, provider, record_date)
            VALUES ('$USER_ID'::uuid, $fico, 'FICO', now())
        " 2>/dev/null; then
            ((migrated++))
        fi
    done < <(sqlite3 -separator '|' "$SQLITE_DB" "SELECT COALESCE(fico,0), COALESCE(vantage,0) FROM credit_scores" 2>/dev/null)
    
    log_info "Migrated $migrated credit_scores"
}

# Migrate life_events - using COPY FROM for robustness
migrate_life_events() {
    log_info "Migrating life_events..."
    local existing=$(run_psql -t -c "SELECT COUNT(*) FROM life_events" | tr -d ' ')
    if [ "$existing" -gt 0 ]; then
        log_info "Life events already exist ($existing), skipping"
        return
    fi
    
    local count=$(sqlite3 "$SQLITE_DB" "SELECT COUNT(*) FROM life_events WHERE summary IS NOT NULL AND trim(summary) != '';" 2>/dev/null || echo "0")
    [ "$count" -eq "0" ] && return
    
    log_info "Processing $count life_events..."
    
    # Create staging table
    run_psql -c "DROP TABLE IF EXISTS staging_life_events;" 2>/dev/null
    run_psql -c "CREATE TABLE staging_life_events (title TEXT, description TEXT, location TEXT, event_date TEXT);" 2>/dev/null
    
    # Export to CSV and import
    sqlite3 -header -csv "$SQLITE_DB" "SELECT summary, description, location, start FROM life_events WHERE summary IS NOT NULL AND trim(summary) != '';" | tail -n +2 | run_psql -c "COPY staging_life_events (title, description, location, event_date) FROM STDIN WITH (FORMAT csv)" 2>/dev/null
    
    # Insert from staging
    run_psql -c "
        INSERT INTO life_events (user_id, title, description, location, event_date)
        SELECT '$USER_ID'::uuid, title, NULL, location, NULL FROM staging_life_events;
    " 2>/dev/null
    
    local migrated=$(run_psql -t -c "SELECT COUNT(*) FROM life_events" | tr -d ' ')
    run_psql -c "DROP TABLE staging_life_events;" 2>/dev/null
    
    log_info "Migrated $migrated life_events"
}

# Migrate family
migrate_family() {
    log_info "Migrating family..."
    local existing=$(run_psql -t -c "SELECT COUNT(*) FROM family" | tr -d ' ')
    if [ "$existing" -gt 0 ]; then
        log_info "Family already exists ($existing), skipping"
        return
    fi
    
    local count=$(sqlite3 "$SQLITE_DB" "SELECT COUNT(*) FROM family" 2>/dev/null || echo "0")
    [ "$count" -eq "0" ] && return
    
    # Create staging table
    run_psql -c "DROP TABLE IF EXISTS staging_family;" 2>/dev/null
    run_psql -c "CREATE TABLE staging_family (name TEXT, relationship TEXT, birth_date TEXT);" 2>/dev/null
    
    # Export to CSV and import
    sqlite3 -header -csv "$SQLITE_DB" "SELECT name, relation, birthdate FROM family;" | tail -n +2 | run_psql -c "COPY staging_family (name, relationship, birth_date) FROM STDIN WITH (FORMAT csv)" 2>/dev/null
    
    # Insert from staging
    run_psql -c "
        INSERT INTO family (user_id, name, relationship, birth_date)
        SELECT '$USER_ID'::uuid, name, relationship, NULL FROM staging_family;
    " 2>/dev/null
    
    local migrated=$(run_psql -t -c "SELECT COUNT(*) FROM family" | tr -d ' ')
    run_psql -c "DROP TABLE staging_family;" 2>/dev/null
    
    log_info "Migrated $migrated family members"
}

# Migrate career_employers
migrate_career_employers() {
    log_info "Migrating career_employers..."
    local existing=$(run_psql -t -c "SELECT COUNT(*) FROM career_employers" | tr -d ' ')
    if [ "$existing" -gt 0 ]; then
        log_info "Career employers already exist ($existing), skipping"
        return
    fi
    
    local count=$(sqlite3 "$SQLITE_DB" "SELECT COUNT(*) FROM career_employers" 2>/dev/null || echo "0")
    [ "$count" -eq "0" ] && return
    
    # SQLite columns: id, company, position, start_date, end_date, start_salary, end_salary, currency, address
    local migrated=0
    while IFS='|' read -r company position start_date end_date start_salary end_salary currency address; do
        [ -z "$company" ] && continue
        company="${company//\'/\'\'}"
        
        local start_sql="NULL"
        local end_sql="NULL"
        [ -n "$start_date" ] && start_sql="'$start_date'"
        [ -n "$end_date" ] && end_sql="'$end_date'"
        
        if run_psql -c "
            INSERT INTO career_employers (user_id, company_name, job_title, start_date, end_date, salary, location)
            VALUES ('$USER_ID'::uuid, '$company', '$position', $start_sql, $end_sql, ${start_salary:-0}, '$address')
        " 2>/dev/null; then
            ((migrated++))
        fi
    done < <(sqlite3 -separator '|' "$SQLITE_DB" "SELECT COALESCE(company,''), COALESCE(position,''), COALESCE(start_date,''), COALESCE(end_date,''), COALESCE(start_salary,0), COALESCE(end_salary,0), COALESCE(currency,''), COALESCE(address,'') FROM career_employers" 2>/dev/null)
    
    log_info "Migrated $migrated career_employers"
}

# Migrate projects
migrate_projects() {
    log_info "Migrating projects..."
    local existing=$(run_psql -t -c "SELECT COUNT(*) FROM projects" | tr -d ' ')
    if [ "$existing" -gt 0 ]; then
        log_info "Projects already exist ($existing), skipping"
        return
    fi
    
    local count=$(sqlite3 "$SQLITE_DB" "SELECT COUNT(*) FROM projects" 2>/dev/null || echo "0")
    [ "$count" -eq "0" ] && return
    
    # Simple insert one by one for simplicity
    local migrated=0
    while IFS= read -r line; do
        # Parse CSV line - handle quoted fields
        local name status
        name=$(echo "$line" | sed 's/^"//;s/"$//' | cut -d',' -f1)
        status=$(echo "$line" | sed 's/^"//;s/"$//' | cut -d',' -f2)
        
        [ -z "$name" ] && continue
        name="${name//\'/\'\'}"
        
        if run_psql -c "INSERT INTO projects (user_id, name, status) VALUES ('$USER_ID'::uuid, '$name', '$status')" 2>/dev/null; then
            ((migrated++))
        fi
    done < <(sqlite3 -csv "$SQLITE_DB" "SELECT name, status FROM projects;" 2>/dev/null)
    
    log_info "Migrated $migrated projects"
}

# Migrate locations
migrate_locations() {
    log_info "Migrating locations..."
    local existing=$(run_psql -t -c "SELECT COUNT(*) FROM locations" | tr -d ' ')
    if [ "$existing" -gt 0 ]; then
        log_info "Locations already exist ($existing), skipping"
        return
    fi
    
    local count=$(sqlite3 "$SQLITE_DB" "SELECT COUNT(*) FROM locations" 2>/dev/null || echo "0")
    [ "$count" -eq "0" ] && return
    
    # SQLite columns: id, city, state, country, created_at, continent, status
    local migrated=0
    while IFS='|' read -r city state country continent status; do
        [ -z "$city" ] && [ -z "$country" ] && continue
        
        if run_psql -c "
            INSERT INTO locations (user_id, name, city, state, country, location_type)
            VALUES ('$USER_ID'::uuid, '$city', '$city', '$state', '$country', '$status')
        " 2>/dev/null; then
            ((migrated++))
        fi
    done < <(sqlite3 -separator '|' "$SQLITE_DB" "SELECT COALESCE(city,''), COALESCE(state,''), COALESCE(country,''), COALESCE(continent,''), COALESCE(status,'') FROM locations" 2>/dev/null)
    
    log_info "Migrated $migrated locations"
}

# Migrate people
migrate_people() {
    log_info "Migrating people..."
    local existing=$(run_psql -t -c "SELECT COUNT(*) FROM people" | tr -d ' ')
    if [ "$existing" -gt 0 ]; then
        log_info "People already exist ($existing), skipping"
        return
    fi
    
    local count=$(sqlite3 "$SQLITE_DB" "SELECT COUNT(*) FROM people" 2>/dev/null || echo "0")
    [ "$count" -eq "0" ] && return
    
    # Simple insert one by one
    local migrated=0
    while IFS= read -r line; do
        local first_name last_name
        first_name=$(echo "$line" | cut -d',' -f1 | tr -d '"')
        last_name=$(echo "$line" | cut -d',' -f2 | tr -d '"')
        
        [ -z "$first_name" ] && [ -z "$last_name" ] && continue
        first_name="${first_name//\'/\'\'}"
        last_name="${last_name//\'/\'\'}"
        
        if run_psql -c "INSERT INTO people (user_id, first_name, last_name) VALUES ('$USER_ID'::uuid, '$first_name', '$last_name')" 2>/dev/null; then
            ((migrated++))
        fi
    done < <(sqlite3 -csv "$SQLITE_DB" "SELECT first_name, last_name FROM people;" 2>/dev/null)
    
    log_info "Migrated $migrated people"
}

# Migrate concerts
migrate_concerts() {
    log_info "Migrating concerts..."
    local existing=$(run_psql -t -c "SELECT COUNT(*) FROM concerts" | tr -d ' ')
    if [ "$existing" -gt 0 ]; then
        log_info "Concerts already exist ($existing), skipping"
        return
    fi
    
    local count=$(sqlite3 "$SQLITE_DB" "SELECT COUNT(*) FROM concerts" 2>/dev/null || echo "0")
    [ "$count" -eq "0" ] && return
    
    # Simple insert one by one
    local migrated=0
    while IFS= read -r line; do
        local artist venue city date
        artist=$(echo "$line" | cut -d',' -f1 | tr -d '"')
        venue=$(echo "$line" | cut -d',' -f2 | tr -d '"')
        city=$(echo "$line" | cut -d',' -f3 | tr -d '"')
        
        [ -z "$artist" ] && continue
        artist="${artist//\'/\'\'}"
        
        if run_psql -c "INSERT INTO concerts (user_id, artist_name, venue, city) VALUES ('$USER_ID'::uuid, '$artist', '$venue', '$city')" 2>/dev/null; then
            ((migrated++))
        fi
    done < <(sqlite3 -csv "$SQLITE_DB" "SELECT artist, venue, city, date FROM concerts;" 2>/dev/null)
    
    log_info "Migrated $migrated concerts"
}

# Migrate games
migrate_games() {
    log_info "Migrating games..."
    local existing=$(run_psql -t -c "SELECT COUNT(*) FROM games" | tr -d ' ')
    if [ "$existing" -gt 0 ]; then
        log_info "Games already exist ($existing), skipping"
        return
    fi
    
    local count=$(sqlite3 "$SQLITE_DB" "SELECT COUNT(*) FROM games" 2>/dev/null || echo "0")
    [ "$count" -eq "0" ] && return
    
    # SQLite columns: id, game_title, platform, release_year
    local migrated=0
    while IFS='|' read -r game_title platform release_year; do
        [ -z "$game_title" ] && continue
        game_title="${game_title//\'/\'\'}"
        
        if run_psql -c "
            INSERT INTO games (user_id, title, platform, genre)
            VALUES ('$USER_ID'::uuid, '$game_title', '$platform', 'video_games')
        " 2>/dev/null; then
            ((migrated++))
        fi
    done < <(sqlite3 -separator '|' "$SQLITE_DB" "SELECT COALESCE(game_title,''), COALESCE(platform,''), COALESCE(release_year,0) FROM games" 2>/dev/null)
    
    log_info "Migrated $migrated games"
}

# Migrate entertainment_backlog
migrate_entertainment_backlog() {
    log_info "Migrating entertainment_backlog..."
    local existing=$(run_psql -t -c "SELECT COUNT(*) FROM entertainment_backlog" | tr -d ' ')
    if [ "$existing" -gt 0 ]; then
        log_info "Entertainment backlog already exists ($existing), skipping"
        return
    fi
    
    local count=$(sqlite3 "$SQLITE_DB" "SELECT COUNT(*) FROM entertainment_backlog" 2>/dev/null || echo "0")
    [ "$count" -eq "0" ] && return
    
    # SQLite columns: id, name, type, series, watch_date
    local migrated=0
    while IFS='|' read -r name type series watch_date; do
        [ -z "$name" ] && continue
        name="${name//\'/\'\'}"
        
        if run_psql -c "
            INSERT INTO entertainment_backlog (user_id, title, media_type, genre, status)
            VALUES ('$USER_ID'::uuid, '$name', '$type', '$series', 'backlog')
        " 2>/dev/null; then
            ((migrated++))
        fi
    done < <(sqlite3 -separator '|' "$SQLITE_DB" "SELECT COALESCE(name,''), COALESCE(type,''), COALESCE(series,''), COALESCE(watch_date,'') FROM entertainment_backlog" 2>/dev/null)
    
    log_info "Migrated $migrated entertainment_backlog items"
}

# Migrate reading_log
migrate_reading_log() {
    log_info "Migrating reading_log..."
    local existing=$(run_psql -t -c "SELECT COUNT(*) FROM reading_log" | tr -d ' ')
    if [ "$existing" -gt 0 ]; then
        log_info "Reading log already exists ($existing), skipping"
        return
    fi
    
    local count=$(sqlite3 "$SQLITE_DB" "SELECT COUNT(*) FROM reading_log" 2>/dev/null || echo "0")
    [ "$count" -eq "0" ] && return
    
    # SQLite columns: id, name, author, status, date_read, category, cover, issue, type
    local migrated=0
    while IFS='|' read -r name author status date_read category cover issue type; do
        [ -z "$name" ] && continue
        name="${name//\'/\'\'}"
        author="${author//\'/\'\'}"
        
        if run_psql -c "
            INSERT INTO reading_log (user_id, book_title, author, status)
            VALUES ('$USER_ID'::uuid, '$name', '$author', '$status')
        " 2>/dev/null; then
            ((migrated++))
        fi
    done < <(sqlite3 -separator '|' "$SQLITE_DB" "SELECT COALESCE(name,''), COALESCE(author,''), COALESCE(status,'reading'), COALESCE(date_read,''), COALESCE(category,''), COALESCE(cover,''), COALESCE(issue,''), COALESCE(type,'') FROM reading_log" 2>/dev/null)
    
    log_info "Migrated $migrated reading_log entries"
}

# Migrate media_log
migrate_media_log() {
    log_info "Migrating media_log..."
    local existing=$(run_psql -t -c "SELECT COUNT(*) FROM media_log" | tr -d ' ')
    if [ "$existing" -gt 0 ]; then
        log_info "Media log already exists ($existing), skipping"
        return
    fi
    
    local count=$(sqlite3 "$SQLITE_DB" "SELECT COUNT(*) FROM media_log" 2>/dev/null || echo "0")
    [ "$count" -eq "0" ] && return
    
    # Simple insert one by one
    local migrated=0
    while IFS= read -r line; do
        local name media_type latest_rating
        name=$(echo "$line" | cut -d',' -f1 | tr -d '"')
        media_type=$(echo "$line" | tail -c 100 | cut -d',' -f1 | tr -d '"')
        latest_rating=$(echo "$line" | tail -c 50 | cut -d',' -f1 | tr -d '"')
        
        [ -z "$name" ] && continue
        name="${name//\'/\'\'}"
        
        if run_psql -c "INSERT INTO media_log (user_id, title, media_type, notes) VALUES ('$USER_ID'::uuid, '$name', '$media_type', '$latest_rating')" 2>/dev/null; then
            ((migrated++))
        fi
    done < <(sqlite3 -csv "$SQLITE_DB" "SELECT name, media_type, latest_rating FROM media_log;" 2>/dev/null)
    
    log_info "Migrated $migrated media_log entries"
}

# Migrate finance_expenses
migrate_finance_expenses() {
    log_info "Migrating finance_expenses..."
    local existing=$(run_psql -t -c "SELECT COUNT(*) FROM finance_expenses" | tr -d ' ')
    if [ "$existing" -gt 0 ]; then
        log_info "Finance expenses already exist ($existing), skipping"
        return
    fi
    
    local count=$(sqlite3 "$SQLITE_DB" "SELECT COUNT(*) FROM finance_expenses" 2>/dev/null || echo "0")
    [ "$count" -eq "0" ] && return
    
    # SQLite columns: id, payee, monthly_cost, type, billing_period, situation, year, category, start_date, end_date, annual_cost
    local migrated=0
    while IFS='|' read -r payee monthly_cost type billing_period situation year category start_date end_date annual_cost; do
        [ -z "$payee" ] && continue
        payee="${payee//\'/\'\'}"
        
        if run_psql -c "
            INSERT INTO finance_expenses (user_id, category, amount, vendor, payment_method, notes)
            VALUES ('$USER_ID'::uuid, '$category', ${monthly_cost:-0}, '$payee', '$billing_period', '$type')
        " 2>/dev/null; then
            ((migrated++))
        fi
    done < <(sqlite3 -separator '|' "$SQLITE_DB" "SELECT COALESCE(payee,''), COALESCE(monthly_cost,0), COALESCE(type,''), COALESCE(billing_period,''), COALESCE(situation,''), COALESCE(year,0), COALESCE(category,''), COALESCE(start_date,''), COALESCE(end_date,''), COALESCE(annual_cost,0) FROM finance_expenses" 2>/dev/null)
    
    log_info "Migrated $migrated finance_expenses"
}

# Migrate income_log
migrate_income_log() {
    log_info "Migrating income_log..."
    local existing=$(run_psql -t -c "SELECT COUNT(*) FROM income_log" | tr -d ' ')
    if [ "$existing" -gt 0 ]; then
        log_info "Income log already exists ($existing), skipping"
        return
    fi
    
    local count=$(sqlite3 "$SQLITE_DB" "SELECT COUNT(*) FROM income_log" 2>/dev/null || echo "0")
    [ "$count" -eq "0" ] && return
    
    # SQLite columns: id, year, source, location, gross_amount, net_amount, type, tax_details
    local migrated=0
    while IFS='|' read -r year source location gross_amount net_amount type tax_details; do
        [ -z "$source" ] && continue
        source="${source//\'/\'\'}"
        
        if run_psql -c "
            INSERT INTO income_log (user_id, source, amount, income_type)
            VALUES ('$USER_ID'::uuid, '$source', ${gross_amount:-0}, '$type')
        " 2>/dev/null; then
            ((migrated++))
        fi
    done < <(sqlite3 -separator '|' "$SQLITE_DB" "SELECT COALESCE(year,0), COALESCE(source,''), COALESCE(location,''), COALESCE(gross_amount,0), COALESCE(net_amount,0), COALESCE(type,''), COALESCE(tax_details,'') FROM income_log" 2>/dev/null)
    
    log_info "Migrated $migrated income_log entries"
}

# Dry run
dry_run() {
    log_info "=== Extended Migration Dry Run ==="
    log_info "SQLite: $SQLITE_DB"
    log_info "PostgreSQL: $PG_URL"
    log_info ""
    log_info "Would migrate:"
    log_info "  credit_scores: $(sqlite3 "$SQLITE_DB" 'SELECT COUNT(*) FROM credit_scores' 2>/dev/null || echo 0)"
    log_info "  life_events: $(sqlite3 "$SQLITE_DB" 'SELECT COUNT(*) FROM life_events' 2>/dev/null || echo 0)"
    log_info "  family: $(sqlite3 "$SQLITE_DB" 'SELECT COUNT(*) FROM family' 2>/dev/null || echo 0)"
    log_info "  career_employers: $(sqlite3 "$SQLITE_DB" 'SELECT COUNT(*) FROM career_employers' 2>/dev/null || echo 0)"
    log_info "  projects: $(sqlite3 "$SQLITE_DB" 'SELECT COUNT(*) FROM projects' 2>/dev/null || echo 0)"
    log_info "  locations: $(sqlite3 "$SQLITE_DB" 'SELECT COUNT(*) FROM locations' 2>/dev/null || echo 0)"
    log_info "  people: $(sqlite3 "$SQLITE_DB" 'SELECT COUNT(*) FROM people' 2>/dev/null || echo 0)"
    log_info "  concerts: $(sqlite3 "$SQLITE_DB" 'SELECT COUNT(*) FROM concerts' 2>/dev/null || echo 0)"
    log_info "  games: $(sqlite3 "$SQLITE_DB" 'SELECT COUNT(*) FROM games' 2>/dev/null || echo 0)"
    log_info "  entertainment_backlog: $(sqlite3 "$SQLITE_DB" 'SELECT COUNT(*) FROM entertainment_backlog' 2>/dev/null || echo 0)"
    log_info "  reading_log: $(sqlite3 "$SQLITE_DB" 'SELECT COUNT(*) FROM reading_log' 2>/dev/null || echo 0)"
    log_info "  media_log: $(sqlite3 "$SQLITE_DB" 'SELECT COUNT(*) FROM media_log' 2>/dev/null || echo 0)"
    log_info "  finance_expenses: $(sqlite3 "$SQLITE_DB" 'SELECT COUNT(*) FROM finance_expenses' 2>/dev/null || echo 0)"
    log_info "  income_log: $(sqlite3 "$SQLITE_DB" 'SELECT COUNT(*) FROM income_log' 2>/dev/null || echo 0)"
}

# Main
main() {
    local mode="${1:-dry-run}"
    
    if [ "$#" -ge 2 ]; then
        USER_ID="$2"
    fi
    
    log_info "=== Extended SQLite to PostgreSQL Migration ==="
    
    get_user_id
    
    if [ "$mode" = "dry-run" ]; then
        dry_run
    elif [ "$mode" = "execute" ]; then
        migrate_credit_scores
        migrate_life_events
        migrate_family
        migrate_credit_scores
        migrate_life_events
        migrate_family
        migrate_career_employers
        migrate_projects
        migrate_locations
        migrate_people
        migrate_concerts
        migrate_games
        migrate_entertainment_backlog
        migrate_reading_log
        migrate_media_log
        migrate_finance_expenses
        migrate_income_log
        
        log_info "=== Extended Migration Complete ==="
    else
        log_error "Unknown mode: $mode"
        exit 1
    fi
}

main "$@"
