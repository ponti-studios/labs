.PHONY: dev-earth dev-commune dev-labyrinth dev-tempo dev-ui dev-health check clean reset

dev-earth:
	pnpm dev:earth

dev-commune:
	pnpm dev:commune

dev-labyrinth:
	pnpm dev:labyrinth

dev-tempo:
	pnpm dev:tempo

dev-ui:
	pnpm dev:ui

dev-health:
	pnpm dev:health

check:
	pnpm lint
	pnpm typecheck
	pnpm test

clean:
	find . -type d -name "node_modules" -prune -exec rm -rf {} +
	find . -type d \( -name "dist" -o -name "build" -o -name "coverage" -o -name ".turbo" -o -name ".react-router" \) -prune -exec rm -rf {} +

reset: clean install
	docker build -f docker/workspace-base.Dockerfile --target workspace-runtime-base -t pontistudios/labs-workspace-runtime:latest .

setup-minio:
	docker exec foundation-minio mc alias set local http://localhost:9000 minioadmin minioadmin
	docker exec foundation-minio mc mb local/labyrinth
	docker exec foundation-minio mc anonymous set public local/labyrinth
