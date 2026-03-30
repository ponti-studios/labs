#!/usr/bin/env python3
"""Count tokens in text files within a folder using tiktoken."""

import sys
import tiktoken
from pathlib import Path

def count_tokens(text: str, enc) -> int:
    return len(enc.encode(text))

def process_file(path: Path, enc) -> int | None:
    try:
        text = path.read_text(encoding="utf-8")
        return count_tokens(text, enc)
    except Exception:
        return None

def main():
    folder = Path(sys.argv[1]) if len(sys.argv) > 1 else Path.cwd()
    enc = tiktoken.get_encoding("cl100k_base")

    total = 0
    file_count = 0

    for path in sorted(folder.rglob("*")):
        if path.is_file():
            tokens = process_file(path, enc)
            if tokens is not None:
                rel = path.relative_to(folder)
                print(f"{tokens:>8}  {rel}")
                total += tokens
                file_count += 1

    print(f"\n{total:>8}  TOTAL ({file_count} files)")

if __name__ == "__main__":
    main()
