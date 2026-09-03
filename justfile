# Studio standard interface: up / dev / check / test.
# Recipe names are identical in every repo; bodies delegate to this repo's
# native scripts. `up` ensures shared local deps (portless proxy) and prints
# this repo's stable URLs. Foundation infra (db/redis/minio/jaeger) is
# separate: just -f ~/Developer/foundation/justfile up

default:
    @just --list

up:
    #!/usr/bin/env bash
    set -euo pipefail
    # Check if the portless proxy is running on localhost:4200
    if [ "$(curl -k -s -o /dev/null -w '%{http_code}' -m 3 https://localhost:4200/)" = "000" ]; then
      echo "starting portless proxy..."
      pnpm exec portless proxy start -p 4200 --tld lvh.me
    else
      echo "proxy already up on :4200"
    fi
    echo "labyrinth: https://labyrinth.lvh.me:4200"
    echo "what:      https://what.lvh.me:4200"

# Boot labyrinth + what through the portless proxy.
dev:
    pnpm exec portless run

check:
    pnpm typecheck && pnpm lint:check

test:
    pnpm test
