"""Quick demo: train the model via CLI.

This script shows how to use the rec-sys batch + recommend workflow.

Usage:
    python scripts/run_batch.py
    rec-sys recommend --user 1 --n 10

Or directly via the CLI:
    rec-sys batch --data-dir data/ml-1m --factors 64
"""

import subprocess
import sys

def main() -> None:
    print("Training model via: rec-sys batch")
    print("This will save the trained model to ~/.rec-sys/")
    print()

    result = subprocess.run([sys.executable, "-m", "rec_sys.cli", "batch"], cwd="/")
    sys.exit(result.returncode)

if __name__ == "__main__":
    main()
