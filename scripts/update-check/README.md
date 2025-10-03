# Update Check and Self-Repair System

An intelligent update check and self-repair system for the Cursor Template Project that monitors dependencies, Spec Kit installation, and configuration files.

## Features

- **Dependency Version Checking**: Automatically detects outdated npm packages
- **Spec Kit Validation**: Verifies Spec Kit installation and configuration
- **Configuration Validation**: Checks .cursor/rules, package.json, and other config files
- **Automated Repair**: Fixes common issues automatically
- **Status Reporting**: Provides clear status reports and recommendations

## Usage

### Check for Issues
```bash
npm run update-check
```

### Check and Repair Issues
```bash
npm run update-check:repair
```

### Show System Status
```bash
npm run update-check:status
```

### Advanced Options

#### Check Command
```bash
node scripts/update-check/dist/index.js check [options]
```

Options:
- `-v, --verbose`: Enable verbose output
- `--no-deps`: Skip dependency checks
- `--no-spec-kit`: Skip Spec Kit checks
- `--no-config`: Skip configuration checks

#### Repair Command
```bash
node scripts/update-check/dist/index.js repair [options]
```

Options:
- `-v, --verbose`: Enable verbose output
- `--dry-run`: Show what would be repaired without making changes
- `--backup`: Create backup before making changes (default: true)

#### Status Command
```bash
node scripts/update-check/dist/index.js status [options]
```

Options:
- `-v, --verbose`: Enable verbose output

## What It Checks

### Dependencies
- Outdated npm packages
- Security vulnerabilities
- Node.js and npm versions

### Spec Kit
- Installation status
- Available commands
- Directory structure
- Template files

### Configuration
- package.json validity
- TypeScript configuration
- ESLint configuration
- .cursor/rules structure
- Environment files

## What It Can Repair

### Dependencies
- Update outdated packages
- Fix security vulnerabilities

### Spec Kit
- Create missing directories
- Generate missing template files
- Fix structure issues

### Configuration
- Fix package.json issues
- Repair TypeScript configuration
- Create missing environment files

## Configuration

The system can be configured via `.update-check.json` in the project root:

```json
{
  "updateCheck": {
    "enabled": true,
    "checkInterval": "daily",
    "autoRepair": false,
    "notifications": {
      "console": true,
      "file": true,
      "email": false
    }
  },
  "checks": {
    "dependencies": true,
    "specKit": true,
    "configuration": true,
    "projectStructure": true
  },
  "repairs": {
    "autoFix": false,
    "backupChanges": true,
    "allowedRepairs": ["dependencies", "configuration"]
  }
}
```

## Logging

The system creates detailed logs in `update-check.log` and outputs to console. Use `--verbose` for more detailed information.

## Safety Features

- **Backup System**: Creates backups before making changes
- **Dry Run Mode**: Test repairs without making changes
- **Rollback Capability**: Can undo automated changes
- **Detailed Logging**: All operations are logged for audit

## Integration

The update check system integrates with:
- Existing npm scripts
- Git workflow
- CI/CD pipelines
- Template validation

## Development

To build the system:
```bash
cd scripts/update-check
npm install
npm run build
```

To run in development mode:
```bash
npm run dev
```
