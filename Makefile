.PHONY: dev-cartograph dev-commune dev-labyrinth dev-tempo dev-ui dev-vitalis check clean reset

dev-cartograph:
	pnpm dev:cartograph

dev-commune:
	pnpm dev:commune

dev-labyrinth:
	pnpm dev:labyrinth

dev-tempo:
	pnpm dev:tempo

dev-ui:
	pnpm dev:ui

dev-vitalis:
	pnpm dev:vitalis

check:
	pnpm lint
	pnpm typecheck
	pnpm test

clean:
	find . -type d -name "node_modules" -prune -exec rm -rf {} +
	find . -type d \( -name "dist" -o -name "build" -o -name "coverage" -o -name ".turbo" -o -name ".react-router" \) -prune -exec rm -rf {} +

reset: clean install
	docker build -f docker/workspace-base.Dockerfile --target workspace-runtime-base -t pontistudios/labs-workspace-runtime:latest .
