# Execution Scripts

This folder contains **deterministic Python scripts** that do the actual work.

## Principles
- Scripts handle API calls, data processing, file I/O, and database operations
- Each script should be **focused** — one clear responsibility
- Scripts must be **well-commented** so the orchestration layer can understand them
- Environment variables and API keys come from `../.env`
- All intermediate files go to `../.tmp/`

## Before Creating a New Script
1. Check if an existing script already handles the task
2. If modifying an existing script, test thoroughly before committing
3. Follow the self-annealing loop: fix → update → test → document

## Script Template
```python
"""
Script: script_name.py
Purpose: Brief description of what this script does.
Inputs: What arguments/env vars it expects.
Outputs: What it produces.
"""

import os
from dotenv import load_dotenv

load_dotenv()

def main():
    # Your logic here
    pass

if __name__ == "__main__":
    main()
```
