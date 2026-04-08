#!/bin/bash
# Archive SQLite data to JSON
# Exports tables that weren't migrated to PostgreSQL

set -euo pipefail

SQLITE_DB="${SQLITE_DB:-$HOME/.config/kuma
ARCHIVE_DIR="${ARCHIVE_DIR:-/Users/charlesponti/Documents/data-archives}"

log_info() { echo "[INFO] $*"; }

# Google data tables
GOOGLE_TABLES=(
    "google_account"
    "google_activities_a_list_of_google_services_accessed_by"
    "google_australia"
    "google_cashback_rewards"
    "google_channel"
    "google_channel_community_moderation_settings"
    "google_channel_feature_data"
    "google_channel_images"
    "google_channel_page_settings"
    "google_channel_url_configs"
    "google_comments"
    "google_default_list"
    "google_devices_a_list_of_devices_i_e_nest_pixel_iph"
    "google_favorite_images"
    "google_favorite_jobs"
    "google_info"
    "google_live_chats"
    "google_members"
    "google_mobile_devices"
    "google_money_sends_and_requests"
    "google_music_library_songs"
    "google_my_cookbook"
    "google_my_shopping_list"
    "google_not_interested_setting"
    "google_notification_tokens"
    "google_playlists"
    "google_profile"
    "google_reading_list"
    "google_recently_viewed_discussions"
    "google_recently_viewed_groups"
    "google_saves_data"
    "google_subscriptions"
    "google_tombstones"
    "google_videos_log"
    "google_your_follows"
    "google_your_liked_content"
    "google_your_personalization_feedback"
)

# Spotify/YouTube tables
SPOTIFY_TABLES=(
    "spotify_follow"
    "spotify_payments"
    "spotify_userdata"
    "spotify_yourlibrary"
    "unified_listening_log"
    "unified_playlist_items"
    "unified_playlists"
    "unified_activities"
    "unified_notes"
    "unified_contacts"
)

# Social/Audit tables
SOCIAL_TABLES=(
    "social_comments"
    "social_connections"
    "social_likes"
    "social_media"
    "social_messages"
    "social_posts"
    "audit_log"
    "search_index"
    "searches"
    "podcast_plays"
    "unified_health_log"
    "unified_activity_people"
    "amazon_purchases"
    "entity_relationships"
    "entity_tags"
)

# Other tables
OTHER_TABLES=(
    "activity_log"
    "activity_types"
    "calendar_event_categories"
    "calendar_event_type_mappings"
    "calendar_event_types"
    "calendar_summary_map"
    "domains"
    "human_needs_and_drivers"
    "meal_types"
    "objectives"
    "key_results"
    "residences"
    "schools"
    "services"
    "phone_numbers"
    "relationships"
    "tarot_readings"
    "tax_rates"
    "transportation_types"
    "trip_categories"
    "trip_tags"
    "trip_attendees"
    "runway"
    "personal_sizes"
    "years"
    "financial_locations"
    "payment_methods"
    "account_aliases"
)

export_table() {
    local table="$1"
    local output_file="$ARCHIVE_DIR/${table}.json"
    
    # Check if table exists
    if ! sqlite3 "$SQLITE_DB" "SELECT name FROM sqlite_master WHERE type='table' AND name='$table';" 2>/dev/null | grep -q "$table"; then
        log_info "Table $table does not exist, skipping"
        return
    fi
    
    # Get row count
    local count=$(sqlite3 "$SQLITE_DB" "SELECT COUNT(*) FROM $table" 2>/dev/null || echo "0")
    
    if [ "$count" -eq 0 ]; then
        log_info "$table: 0 rows, skipping"
        return
    fi
    
    # Export to JSON
    log_info "Exporting $table ($count rows)..."
    sqlite3 -header -json "$SQLITE_DB" "SELECT * FROM $table;" > "$output_file" 2>/dev/null
    
    if [ -f "$output_file" ]; then
        local size=$(du -h "$output_file" | cut -f1)
        log_info "  → $output_file ($size)"
    fi
}

main() {
    log_info "=== SQLite Data Archiver ==="
    log_info "Source: $SQLITE_DB"
    log_info "Archive: $ARCHIVE_DIR"
    log_info ""
    
    # Create archive directory
    mkdir -p "$ARCHIVE_DIR"
    
    log_info "=== Google Data (40 tables) ==="
    for table in "${GOOGLE_TABLES[@]}"; do
        export_table "$table"
    done
    
    log_info ""
    log_info "=== Spotify/YouTube Data (10 tables) ==="
    for table in "${SPOTIFY_TABLES[@]}"; do
        export_table "$table"
    done
    
    log_info ""
    log_info "=== Social/Audit Data (15 tables) ==="
    for table in "${SOCIAL_TABLES[@]}"; do
        export_table "$table"
    done
    
    log_info ""
    log_info "=== Other Tables (27 tables) ==="
    for table in "${OTHER_TABLES[@]}"; do
        export_table "$table"
    done
    
    log_info ""
    log_info "=== Archive Complete ==="
    log_info "Total files: $(ls -1 "$ARCHIVE_DIR" | wc -l)"
    log_info "Total size: $(du -sh "$ARCHIVE_DIR" | cut -f1)"
}

main "$@"
