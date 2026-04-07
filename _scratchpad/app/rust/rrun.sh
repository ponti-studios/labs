#!/bin/bash
# Quick runner for rust-playground binaries
# Usage: rrun <name>  (e.g., rrun numbers)

cd "$(dirname "$0")"

if [ -z "$1" ]; then
    echo "Usage: rrun <binary-name>"
    echo "Available binaries:"
    cargo run --quiet -- --list 2>/dev/null || true
    exit 1
fi

cargo run --quiet --bin "$1"