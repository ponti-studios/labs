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
    # Check if the portless proxy is running on localhost:443
    if [ "$(curl -k -s -o /dev/null -w '%{http_code}' -m 3 https://localhost:443/)" = "000" ]; then
      echo "starting portless proxy..."
      pnpm exec portless proxy start -p 443 --tld lvh.me
    else
      echo "proxy already up on :443"
    fi
    echo "labyrinth: https://labyrinth.lvh.me"
    echo "what:      https://what.lvh.me"

# Boot labyrinth + what through the portless proxy.
dev:
    pnpm exec portless run

check:
    pnpm typecheck && pnpm lint:check

test:
    pnpm test
