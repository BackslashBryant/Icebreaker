# Git Root Resolution Fix

**Date**: 2025-11-11  
**Issue**: `git rev-parse --show-toplevel` was returning `C:/Users/OrEo2` instead of project root  
**Root Cause**: Stray `.git` folder in user home directory (`C:\Users\OrEo2`)  
**Status**: Fixed

## Problem

When running `git rev-parse --show-toplevel` from certain contexts, it returned `C:/Users/OrEo2` instead of the actual project root (`C:\Users\OrEo2\Desktop\DevOps\1. Projects\Icebreaker`).

## Root Cause

A git repository was accidentally initialized in the user's home directory (`C:\Users\OrEo2`). This repository:
- Has no commits
- Has no remotes
- Is tracking the entire home directory (dangerous!)
- Interferes with git commands run from parent directories

## Solution

1. **Created helper script** (`tools/get-project-root.mjs`) to reliably get project root with validation
2. **Updated workflow rules** (`.cursor/rules/01-workflow.mdc`) to always validate git root and use helper when needed
3. **Stray `.git` folder**: Found in `C:\Users\OrEo2` (user home directory) - **ACTION REQUIRED**: Remove manually if desired:
   ```powershell
   cd C:\Users\OrEo2
   Remove-Item -Recurse -Force .git
   ```
   **Note**: This folder has no commits/remotes and was tracking the entire home directory (dangerous!). Removing it is safe and recommended.
4. **Added safeguard** in workflow rules to detect this issue

## Prevention

- Always run git commands from project root
- Use `tools/get-project-root.mjs` helper when needed
- Never initialize git repos in home directories
- Preflight check validates git root matches project root

## Files Changed

- `tools/get-project-root.mjs` - New helper script
- `.cursor/rules/01-workflow.mdc` - Updated git safety checks
- `tools/preflight.mjs` - Added git root validation

