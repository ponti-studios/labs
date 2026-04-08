// Package database provides SQLite persistence for Kuma
package database

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	_ "github.com/glebarez/sqlite"
)

// DB wraps the SQLite connection
type DB struct {
	conn *sql.DB
	path string
}

// New creates a new SQLite database connection
func New(path string) (*DB, error) {
	dsn := fmt.Sprintf("file:%s?_journal_mode=WAL&_timeout=5000", path)

	conn, err := sql.Open("sqlite", dsn)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}

	conn.SetMaxOpenConns(25)
	conn.SetMaxIdleConns(5)
	conn.SetConnMaxLifetime(5 * time.Minute)

	db := &DB{
		conn: conn,
		path: path,
	}

	if err := db.migrate(); err != nil {
		conn.Close()
		return nil, fmt.Errorf("migration failed: %w", err)
	}

	return db, nil
}

// Close closes the database connection
func (db *DB) Close() error {
	return db.conn.Close()
}

// Ping checks if the database is accessible
func (db *DB) Ping(ctx context.Context) error {
	return db.conn.PingContext(ctx)
}

func (db *DB) migrate() error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	_, err := db.conn.ExecContext(ctx, `
		CREATE TABLE IF NOT EXISTS migrations (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT NOT NULL UNIQUE,
			applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
		)
	`)
	if err != nil {
		return fmt.Errorf("failed to create migrations table: %w", err)
	}

	if err := db.runMigration("001_create_users", `
		CREATE TABLE IF NOT EXISTS users (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			phone_number TEXT NOT NULL UNIQUE,
			name TEXT,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			daily_signs_enabled INTEGER DEFAULT 0,
			last_sign_sent DATETIME
		)
	`); err != nil {
		return err
	}

	if err := db.runMigration("002_create_messages", `
		CREATE TABLE IF NOT EXISTS messages (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			user_id INTEGER NOT NULL,
			role TEXT NOT NULL,
			content TEXT NOT NULL,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (user_id) REFERENCES users(id)
		)
	`); err != nil {
		return err
	}

	if err := db.runMigration("003_create_indexes", `
		CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);
		CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
	`); err != nil {
		return err
	}

	return nil
}

func (db *DB) runMigration(name, sqlStmt string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var count int
	err := db.conn.QueryRowContext(ctx, "SELECT COUNT(*) FROM migrations WHERE name = ?", name).Scan(&count)
	if err != nil {
		return fmt.Errorf("failed to check migration: %w", err)
	}

	if count > 0 {
		return nil
	}

	_, err = db.conn.ExecContext(ctx, sqlStmt)
	if err != nil {
		return fmt.Errorf("failed to apply migration %s: %w", name, err)
	}

	_, err = db.conn.ExecContext(ctx, "INSERT INTO migrations (name) VALUES (?)", name)
	if err != nil {
		return fmt.Errorf("failed to record migration: %w", err)
	}

	return nil
}

// User represents a user in the database
type User struct {
	ID                int64
	PhoneNumber       string
	Name              *string
	CreatedAt         time.Time
	UpdatedAt         time.Time
	DailySignsEnabled bool
	LastSignSent      *time.Time
}

// CreateUser creates a new user
func (db *DB) CreateUser(ctx context.Context, phoneNumber string) (*User, error) {
	result, err := db.conn.ExecContext(ctx,
		"INSERT INTO users (phone_number) VALUES (?)",
		phoneNumber)
	if err != nil {
		return nil, fmt.Errorf("failed to create user: %w", err)
	}

	id, err := result.LastInsertId()
	if err != nil {
		return nil, fmt.Errorf("failed to get last insert id: %w", err)
	}

	return db.GetUserByID(ctx, id)
}

// GetUserByPhoneNumber retrieves a user by phone number
func (db *DB) GetUserByPhoneNumber(ctx context.Context, phoneNumber string) (*User, error) {
	user := &User{}
	var name sql.NullString
	var lastSignSent sql.NullTime

	err := db.conn.QueryRowContext(ctx,
		`SELECT id, phone_number, name, created_at, updated_at, daily_signs_enabled, last_sign_sent 
		 FROM users WHERE phone_number = ?`,
		phoneNumber).Scan(
		&user.ID, &user.PhoneNumber, &name, &user.CreatedAt, &user.UpdatedAt,
		&user.DailySignsEnabled, &lastSignSent)

	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get user: %w", err)
	}

	if name.Valid {
		user.Name = &name.String
	}
	if lastSignSent.Valid {
		user.LastSignSent = &lastSignSent.Time
	}

	return user, nil
}

// GetUserByID retrieves a user by ID
func (db *DB) GetUserByID(ctx context.Context, id int64) (*User, error) {
	user := &User{}
	var name sql.NullString
	var lastSignSent sql.NullTime

	err := db.conn.QueryRowContext(ctx,
		`SELECT id, phone_number, name, created_at, updated_at, daily_signs_enabled, last_sign_sent 
		 FROM users WHERE id = ?`,
		id).Scan(
		&user.ID, &user.PhoneNumber, &name, &user.CreatedAt, &user.UpdatedAt,
		&user.DailySignsEnabled, &lastSignSent)

	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get user: %w", err)
	}

	if name.Valid {
		user.Name = &name.String
	}
	if lastSignSent.Valid {
		user.LastSignSent = &lastSignSent.Time
	}

	return user, nil
}

// UpdateUserName updates a user's name
func (db *DB) UpdateUserName(ctx context.Context, userID int64, name string) error {
	_, err := db.conn.ExecContext(ctx,
		"UPDATE users SET name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
		name, userID)
	if err != nil {
		return fmt.Errorf("failed to update user name: %w", err)
	}
	return nil
}

// ToggleDailySigns enables or disables daily signs
func (db *DB) ToggleDailySigns(ctx context.Context, userID int64, enabled bool) error {
	_, err := db.conn.ExecContext(ctx,
		"UPDATE users SET daily_signs_enabled = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
		enabled, userID)
	if err != nil {
		return fmt.Errorf("failed to toggle daily signs: %w", err)
	}
	return nil
}

// RecordLastSign records when a daily sign was sent
func (db *DB) RecordLastSign(ctx context.Context, userID int64) error {
	_, err := db.conn.ExecContext(ctx,
		"UPDATE users SET last_sign_sent = CURRENT_TIMESTAMP WHERE id = ?",
		userID)
	if err != nil {
		return fmt.Errorf("failed to record last sign: %w", err)
	}
	return nil
}

// Message represents a message in the database
type Message struct {
	ID        int64
	UserID    int64
	Role      string
	Content   string
	CreatedAt time.Time
}

// SaveMessage saves a message to the database
func (db *DB) SaveMessage(ctx context.Context, userID int64, role, content string) (*Message, error) {
	result, err := db.conn.ExecContext(ctx,
		"INSERT INTO messages (user_id, role, content) VALUES (?, ?, ?)",
		userID, role, content)
	if err != nil {
		return nil, fmt.Errorf("failed to save message: %w", err)
	}

	id, err := result.LastInsertId()
	if err != nil {
		return nil, fmt.Errorf("failed to get last insert id: %w", err)
	}

	return db.GetMessageByID(ctx, id)
}

// GetMessageByID retrieves a message by ID
func (db *DB) GetMessageByID(ctx context.Context, id int64) (*Message, error) {
	msg := &Message{}
	err := db.conn.QueryRowContext(ctx,
		"SELECT id, user_id, role, content, created_at FROM messages WHERE id = ?",
		id).Scan(&msg.ID, &msg.UserID, &msg.Role, &msg.Content, &msg.CreatedAt)

	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get message: %w", err)
	}

	return msg, nil
}

// GetConversationHistory retrieves the last N messages for a user
func (db *DB) GetConversationHistory(ctx context.Context, userID int64, limit int) ([]Message, error) {
	rows, err := db.conn.QueryContext(ctx,
		`SELECT id, user_id, role, content, created_at FROM messages 
		 WHERE user_id = ? ORDER BY created_at DESC LIMIT ?`,
		userID, limit)
	if err != nil {
		return nil, fmt.Errorf("failed to get conversation history: %w", err)
	}
	defer rows.Close()

	var messages []Message
	for rows.Next() {
		var msg Message
		if err := rows.Scan(&msg.ID, &msg.UserID, &msg.Role, &msg.Content, &msg.CreatedAt); err != nil {
			return nil, fmt.Errorf("failed to scan message: %w", err)
		}
		messages = append(messages, msg)
	}

	// Reverse to get chronological order
	for i, j := 0, len(messages)-1; i < j; i, j = i+1, j-1 {
		messages[i], messages[j] = messages[j], messages[i]
	}

	return messages, nil
}

// Stats represents usage statistics
type Stats struct {
	TotalUsers     int
	TotalMessages  int
	MessagesToday  int
	ActiveUsers    int
	UsersWithSigns int
}

// GetStats returns usage statistics
func (db *DB) GetStats(ctx context.Context) (*Stats, error) {
	stats := &Stats{}

	err := db.conn.QueryRowContext(ctx, "SELECT COUNT(*) FROM users").Scan(&stats.TotalUsers)
	if err != nil {
		return nil, fmt.Errorf("failed to get total users: %w", err)
	}

	err = db.conn.QueryRowContext(ctx, "SELECT COUNT(*) FROM messages").Scan(&stats.TotalMessages)
	if err != nil {
		return nil, fmt.Errorf("failed to get total messages: %w", err)
	}

	err = db.conn.QueryRowContext(ctx,
		`SELECT COUNT(DISTINCT user_id) FROM messages 
		 WHERE created_at >= date('now')`).Scan(&stats.MessagesToday)
	if err != nil {
		return nil, fmt.Errorf("failed to get messages today: %w", err)
	}

	err = db.conn.QueryRowContext(ctx,
		`SELECT COUNT(DISTINCT user_id) FROM messages 
		 WHERE created_at >= datetime('now', '-7 days')`).Scan(&stats.ActiveUsers)
	if err != nil {
		return nil, fmt.Errorf("failed to get active users: %w", err)
	}

	err = db.conn.QueryRowContext(ctx,
		"SELECT COUNT(*) FROM users WHERE daily_signs_enabled = 1").Scan(&stats.UsersWithSigns)
	if err != nil {
		return nil, fmt.Errorf("failed to get users with signs: %w", err)
	}

	return stats, nil
}

// GetUsersWithDailySigns returns all users who have daily signs enabled
func (db *DB) GetUsersWithDailySigns(ctx context.Context) ([]User, error) {
	rows, err := db.conn.QueryContext(ctx,
		`SELECT id, phone_number, name, created_at, updated_at, daily_signs_enabled, last_sign_sent 
		 FROM users WHERE daily_signs_enabled = 1`)
	if err != nil {
		return nil, fmt.Errorf("failed to get users with daily signs: %w", err)
	}
	defer rows.Close()

	var users []User
	for rows.Next() {
		var user User
		var name sql.NullString
		var lastSignSent sql.NullTime

		if err := rows.Scan(&user.ID, &user.PhoneNumber, &name, &user.CreatedAt, &user.UpdatedAt,
			&user.DailySignsEnabled, &lastSignSent); err != nil {
			return nil, fmt.Errorf("failed to scan user: %w", err)
		}

		if name.Valid {
			user.Name = &name.String
		}
		if lastSignSent.Valid {
			user.LastSignSent = &lastSignSent.Time
		}

		users = append(users, user)
	}

	return users, nil
}
