package main

import (
	"context"
	"database/sql"
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/jackc/pgx/v5"
)

func main() {
	// CLI flags
	voidlineDB := flag.String("voidline-db", "tracking.db", "Path to voidline tracking.db SQLite file")
	possessionName := flag.String("name", "Imported Tracking", "Name for the possession in mcp-server")
	possessionCategory := flag.String("category", "imported", "Category for the possession")
	pgURL := flag.String("pg-url", os.Getenv("DATABASE_URL"), "PostgreSQL connection URL")
	userID := flag.String("user-id", "", "User ID for the possession owner (required)")

	flag.Parse()

	if *userID == "" {
		log.Fatal("user-id is required")
	}

	if *pgURL == "" {
		*pgURL = "postgresql://mcp_server:devpassword@localhost:5433/hominem?sslmode=disable"
	}

	// Open SQLite database
	sqliteDB, err := sql.Open("sqlite3", *voidlineDB)
	if err != nil {
		log.Fatalf("Failed to open voidline database: %v", err)
	}
	defer sqliteDB.Close()

	// Load data from voidline
	acquisitions, err := loadAcquisitions(sqliteDB)
	if err != nil {
		log.Fatalf("Failed to load acquisitions: %v", err)
	}

	usages, err := loadUsages(sqliteDB)
	if err != nil {
		log.Fatalf("Failed to load usages: %v", err)
	}

	reconciliations, err := loadReconciliations(sqliteDB)
	if err != nil {
		log.Fatalf("Failed to load reconciliations: %v", err)
	}

	fmt.Printf("Loaded from voidline:\n")
	fmt.Printf("  - %d acquisitions\n", len(acquisitions))
	fmt.Printf("  - %d usage entries\n", len(usages))
	fmt.Printf("  - %d reconciliations\n", len(reconciliations))

	// Build tracking JSONB
	tracking := map[string]interface{}{
		"acquisitions":    acquisitions,
		"usage":           usages,
		"reconciliations": reconciliations,
	}

	trackingJSON, err := json.Marshal(tracking)
	if err != nil {
		log.Fatalf("Failed to marshal tracking data: %v", err)
	}

	// Connect to PostgreSQL
	ctx := context.Background()
	pgConn, err := pgx.Connect(ctx, *pgURL)
	if err != nil {
		log.Fatalf("Failed to connect to PostgreSQL: %v", err)
	}
	defer pgConn.Close(ctx)

	// Create possession with tracking data
	var possessionID string
	err = pgConn.QueryRow(ctx, `
		INSERT INTO possessions (name, category, value, user_id, tracking)
		VALUES ($1, $2, 0, $3, $4::jsonb)
		RETURNING id
	`, *possessionName, *possessionCategory, *userID, trackingJSON).Scan(&possessionID)

	if err != nil {
		log.Fatalf("Failed to create possession: %v", err)
	}

	fmt.Printf("\nSuccessfully imported to mcp-server!\n")
	fmt.Printf("  - Possession ID: %s\n", possessionID)
	fmt.Printf("  - Name: %s\n", *possessionName)
	fmt.Printf("  - Category: %s\n", *possessionCategory)
	fmt.Printf("\nYou can now query this possession's inventory at:\n")
	fmt.Printf("  GET /api/v1/possessions/%s/inventory\n", possessionID)
	fmt.Printf("  GET /api/v1/possessions/%s/history\n", possessionID)
}

type Acquisition struct {
	ID        string  `json:"id"`
	Amount    float64 `json:"amount"`
	Unit      string  `json:"unit"`
	Date      string  `json:"date"`
	Source    string  `json:"source"`
	CreatedAt string  `json:"createdAt"`
}

type Usage struct {
	ID        string  `json:"id"`
	Amount    float64 `json:"amount"`
	Unit      string  `json:"unit"`
	Date      string  `json:"date"`
	Type      string  `json:"type"`
	Container string  `json:"container"`
	StartDate string  `json:"startDate"`
	EndDate   string  `json:"endDate"`
	PerDay    float64 `json:"perDay"`
	CreatedAt string  `json:"createdAt"`
}

type Reconciliation struct {
	ID        string  `json:"id"`
	Measured  float64 `json:"measured"`
	Unit      string  `json:"unit"`
	Date      string  `json:"date"`
	CreatedAt string  `json:"createdAt"`
}

func loadAcquisitions(db *sql.DB) ([]Acquisition, error) {
	rows, err := db.Query("SELECT id, value, ts FROM acquisition ORDER BY id")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var acquisitions []Acquisition
	for rows.Next() {
		var id int
		var value float64
		var ts sql.NullString
		if err := rows.Scan(&id, &value, &ts); err != nil {
			return nil, err
		}
		date := time.Now().Format("2006-01-02")
		if ts.Valid {
			if t, err := time.Parse("2006-01-02 15:04:05", ts.String); err == nil {
				date = t.Format("2006-01-02")
			}
		}
		acquisitions = append(acquisitions, Acquisition{
			ID:        fmt.Sprintf("import-%d", id),
			Amount:    value,
			Unit:      "grams",
			Date:      date,
			Source:    "imported",
			CreatedAt: time.Now().UTC().Format(time.RFC3339),
		})
	}
	return acquisitions, nil
}

func loadUsages(db *sql.DB) ([]Usage, error) {
	rows, err := db.Query(`
		SELECT id, timestamp, amount, container_id, type, start_date, end_date, amount_per_day 
		FROM usage_log ORDER BY id
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var usages []Usage
	for rows.Next() {
		var id int
		var timestamp sql.NullString
		var amount sql.NullFloat64
		var containerID, utype, startDate, endDate sql.NullString
		var amountPerDay sql.NullFloat64
		if err := rows.Scan(&id, &timestamp, &amount, &containerID, &utype, &startDate, &endDate, &amountPerDay); err != nil {
			return nil, err
		}
		date := time.Now().Format("2006-01-02")
		if timestamp.Valid {
			if t, err := time.Parse("2006-01-02 15:04:05", timestamp.String); err == nil {
				date = t.Format("2006-01-02")
			}
		}
		usage := Usage{
			ID:        fmt.Sprintf("import-%d", id),
			Amount:    0,
			Unit:      "grams",
			Date:      date,
			Type:      "",
			Container: "",
			StartDate: "",
			EndDate:   "",
			PerDay:    0,
			CreatedAt: time.Now().UTC().Format(time.RFC3339),
		}
		if amount.Valid {
			usage.Amount = amount.Float64
		}
		if containerID.Valid {
			usage.Container = containerID.String
		}
		if utype.Valid {
			usage.Type = utype.String
		}
		if startDate.Valid {
			usage.StartDate = startDate.String
		}
		if endDate.Valid {
			usage.EndDate = endDate.String
		}
		if amountPerDay.Valid {
			usage.PerDay = amountPerDay.Float64
		}
		usages = append(usages, usage)
	}
	return usages, nil
}

func loadReconciliations(db *sql.DB) ([]Reconciliation, error) {
	rows, err := db.Query("SELECT id, measured_remaining, ts FROM reconciliation ORDER BY id")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var reconciliations []Reconciliation
	for rows.Next() {
		var id int
		var measured sql.NullFloat64
		var ts sql.NullString
		if err := rows.Scan(&id, &measured, &ts); err != nil {
			return nil, err
		}
		date := time.Now().Format("2006-01-02")
		if ts.Valid {
			if t, err := time.Parse("2006-01-02 15:04:05", ts.String); err == nil {
				date = t.Format("2006-01-02")
			}
		}
		reconciliation := Reconciliation{
			ID:        fmt.Sprintf("import-%d", id),
			Measured:  0,
			Unit:      "grams",
			Date:      date,
			CreatedAt: time.Now().UTC().Format(time.RFC3339),
		}
		if measured.Valid {
			reconciliation.Measured = measured.Float64
		}
		reconciliations = append(reconciliations, reconciliation)
	}
	return reconciliations, nil
}
