"""
Script: health_check.py
Purpose: Verify the project environment is set up correctly.
Inputs: None (reads .env and checks directory structure).
Outputs: Prints a status report to stdout.
"""

import os
import sys

def check_directory(path, label):
    """Check if a required directory exists."""
    exists = os.path.isdir(path)
    status = "[OK]" if exists else "[FAIL]"
    print(f"  {status} {label}: {path}")
    return exists

def check_file(path, label):
    """Check if a required file exists."""
    exists = os.path.isfile(path)
    status = "[OK]" if exists else "[FAIL]"
    print(f"  {status} {label}: {path}")
    return exists

def main():
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    os.chdir(project_root)

    print("=" * 50)
    print("  Project Health Check")
    print("=" * 50)
    all_ok = True

    # Check directories
    print("\nDirectories:")
    for dir_name, label in [
        ("directives", "Directives (SOPs)"),
        ("execution", "Execution (scripts)"),
        (".tmp", "Temp (intermediates)"),
    ]:
        if not check_directory(dir_name, label):
            all_ok = False

    # Check files
    print("\nFiles:")
    for file_name, label in [
        (".env", "Environment config"),
        (".gitignore", "Git ignore rules"),
        ("Agents.md", "Agent instructions"),
    ]:
        if not check_file(file_name, label):
            all_ok = False

    # Check Python environment
    print("\nPython:")
    print(f"  [OK] Version: {sys.version.split()[0]}")

    # Check for dotenv
    try:
        import dotenv
        try:
            from importlib.metadata import version as pkg_version
            ver = pkg_version("python-dotenv")
        except Exception:
            ver = "unknown"
        print(f"  [OK] python-dotenv installed (v{ver})")
    except ImportError:
        print("  [FAIL] python-dotenv not installed (run: pip install python-dotenv)")
        all_ok = False

    # Summary
    print("\n" + "=" * 50)
    if all_ok:
        print("  All checks passed! Environment is ready.")
    else:
        print("  Some checks failed. See above for details.")
    print("=" * 50)

    return 0 if all_ok else 1

if __name__ == "__main__":
    sys.exit(main())
