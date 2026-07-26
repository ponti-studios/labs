#!/usr/bin/env bash
set -euo pipefail
find . -type d -name "node_modules" -prune -exec rm -rf {} +
find . -type d \( -name "dist" -o -name "build" -o -name "coverage" -o -name ".turbo" -o -name ".react-router" \) -prune -exec rm -rf {} +
