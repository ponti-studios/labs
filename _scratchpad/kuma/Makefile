ENV_FILE ?= .env
MIGRATION_SCRIPT := scripts/migrate_sqlite_to_postgres.sh
MIGRATION_LOG ?= tmp/migration.log
SQLITE_DB ?= $(HOME)/.config/hominem/db.sqlite
GOOSE_VERSION ?= v3.24.1
GOOSE_CMD := go run github.com/pressly/goose/v3/cmd/goose@$(GOOSE_VERSION)
MIGRATIONS_DIR ?= migrations

define with_env
	set -a; . $(ENV_FILE); set +a; $(1)
endef

define pg_env
	PG_USER=$${PG_USER:-$${DB_USER:-postgres}} \
	PG_PASSWORD=$${PG_PASSWORD:-$${DB_PASSWORD:-postgres}} \
	PG_DB=$${PG_DB:-$${DB_NAME:-hominem}} \
	PG_PORT=$${PG_PORT:-5433} \
	PG_HOST=$${PG_HOST:-localhost}
endef

.PHONY: migration-run migration-follow migration-counts watch-transactions
.PHONY: migrate-goose-up migrate-goose-status
.PHONY: build-server build-cli test test-cli

migration-run:
	@mkdir -p tmp
	@$(call with_env,$(call pg_env); SQLITE_DB=$(SQLITE_DB) ./$(MIGRATION_SCRIPT) execute | tee $(MIGRATION_LOG))

migration-follow:
	@tail -n 20 -F $(MIGRATION_LOG)

migration-counts:
	@$(call with_env,$(call pg_env); PGPASSWORD=$$PG_PASSWORD psql "postgres://$$PG_USER:$$PG_PASSWORD@$$PG_HOST:$$PG_PORT/$$PG_DB" -c "SELECT table_name, count(*) FROM (VALUES ('financial_accounts', (SELECT COUNT(*) FROM finance_accounts)), ('transactions', (SELECT COUNT(*) FROM transactions)), ('tasks', (SELECT COUNT(*) FROM tasks)), ('events', (SELECT COUNT(*) FROM events)), ('notes', (SELECT COUNT(*) FROM notes)), ('health', (SELECT COUNT(*) FROM health)), ('trips', (SELECT COUNT(*) FROM trips))) AS t(table_name, count);"))

watch-transactions:
	@$(call with_env,$(call pg_env); watch -n 5 "PGPASSWORD=$$PG_PASSWORD psql \"postgres://$$PG_USER:$$PG_PASSWORD@$$PG_HOST:$$PG_PORT/$$PG_DB\" -c \"SELECT COUNT(*) FROM transactions;\"")

migrate-goose-up:
	@$(call with_env,$(call pg_env); DATABASE_URL="postgresql://$$PG_USER:$$PG_PASSWORD@$$PG_HOST:$$PG_PORT/$$PG_DB?sslmode=disable"; $(GOOSE_CMD) -dir $(MIGRATIONS_DIR) postgres "$$DATABASE_URL" up)

migrate-goose-status:
	@$(call with_env,$(call pg_env); DATABASE_URL="postgresql://$$PG_USER:$$PG_PASSWORD@$$PG_HOST:$$PG_PORT/$$PG_DB?sslmode=disable"; $(GOOSE_CMD) -dir $(MIGRATIONS_DIR) postgres "$$DATABASE_URL" status)

build-server:
	go build ./cmd/server

build-cli:
	go build ./cmd/cli

test:
	go test ./...

test-unit:
	go test ./internal/kuma/... -v

test-integration:
	go test ./internal/database/... -v

test-e2e:
	go test ./cmd/server/... -v

test-coverage:
	go test ./... -coverprofile=coverage.out -covermode=atomic
	go tool cover -html=coverage.out -o coverage.html
	@echo "Coverage report generated: coverage.html"

test-all: test-unit test-integration test-e2e
