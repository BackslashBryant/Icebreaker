# Documentation Maintenance Rule

## Purpose

Prevent orphaned documentation files that are created but never referenced, updated, or used.

## Rule

**All documentation files must be:**
1. **Referenced** - Linked from at least one other file (README, guides, rules, scripts)
2. **Used** - Referenced by code, scripts, or actively used workflows
3. **Maintained** - Updated when related code/processes change

## Enforcement

### Pre-Commit Check

Before committing new documentation files:
1. Verify the file is referenced in at least one location:
   - README.md
   - Other documentation files
   - Code comments
   - Scripts/tools
2. If creating a troubleshooting guide, ensure it's linked from:
   - `docs/troubleshooting/README.md` (if exists)
   - Related setup guides
   - Error messages in code

### Periodic Audit

Run `npm run docs:audit` to check for:
- Unreferenced documentation files
- Broken internal links
- Outdated references

### Documentation Types

**Rules** (`.cursor/rules/*.mdc`):
- Must be referenced in other rules or agent workflows
- Must be applied (`alwaysApply: true`) or referenced by globs

**Guides** (`docs/guides/**/*.md`):
- Must be referenced in README.md or other guides
- Must be linked from setup/onboarding documentation

**Troubleshooting** (`docs/troubleshooting/*.md`):
- Must be referenced from:
  - Error messages in code
  - Related setup guides
  - README.md troubleshooting section

**Reference** (`docs/guides/reference/*.md`):
- Must be referenced from setup guides or code comments
- Must be linked from related documentation

## Exceptions

- Archive files (`docs/**/archive/**`) - Historical reference only
- Migration guides (`docs/migration/*.md`) - One-time use, can be archived after migration

## Process

When creating new documentation:
1. **Create the file**
2. **Add reference** immediately:
   - Link from README.md
   - Link from related guides
   - Reference in code/scripts if applicable
3. **Verify** with `npm run docs:audit` before committing

When removing documentation:
1. **Check references** - Search for all references to the file
2. **Update references** - Point to replacement or remove links
3. **Archive if historical** - Move to `archive/` subdirectory
4. **Remove if obsolete** - Delete only if truly no longer needed

## Script

See `tools/docs-audit.mjs` for automated checking.

