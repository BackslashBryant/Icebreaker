#!/usr/bin/env pwsh

[CmdletBinding()]
param(
    [switch]$Json,
    [switch]$Help
)

$ErrorActionPreference = 'Stop'

# Show help if requested
if ($Help) {
    Write-Output @"
Usage: setup-plan.ps1 [OPTIONS]

Sets up the implementation plan by copying the plan template.

OPTIONS:
  -Json               Output results in JSON format
  -Help, -h           Show this help message

EXAMPLES:
  .\setup-plan.ps1
  .\setup-plan.ps1 -Json

"@
    exit 0
}

# Get script directory and load common functions
$SCRIPT_DIR = $PSScriptRoot
. "$SCRIPT_DIR/common.ps1"

# Get all paths and variables from common functions
$paths = Get-FeaturePathsEnv

# Check if we're on a proper feature branch (only for git repos)
if (-not (Test-FeatureBranch -Branch $paths.CURRENT_BRANCH -HasGit:$paths.HAS_GIT)) { 
    exit 1 
}

# Ensure the feature directory exists
if (-not (Test-Path $paths.FEATURE_DIR -PathType Container)) {
    New-Item -ItemType Directory -Path $paths.FEATURE_DIR -Force | Out-Null
}

# Copy plan template if it exists
$TEMPLATE = Join-Path $paths.REPO_ROOT ".specify/templates/plan-template.md"
if (Test-Path $TEMPLATE) {
    Copy-Item $TEMPLATE $paths.IMPL_PLAN
    Write-Output "Copied plan template to $($paths.IMPL_PLAN)"
} else {
    Write-Warning "Warning: Plan template not found at $TEMPLATE"
    # Create a basic plan file if template doesn't exist
    New-Item -ItemType File -Path $paths.IMPL_PLAN -Force | Out-Null
}

# Output results
if ($Json) {
    [PSCustomObject]@{
        FEATURE_SPEC = $paths.FEATURE_SPEC
        IMPL_PLAN = $paths.IMPL_PLAN
        SPECS_DIR = $paths.FEATURE_DIR
        BRANCH = $paths.CURRENT_BRANCH
        HAS_GIT = $paths.HAS_GIT
    } | ConvertTo-Json -Compress
} else {
    Write-Output "FEATURE_SPEC: $($paths.FEATURE_SPEC)"
    Write-Output "IMPL_PLAN: $($paths.IMPL_PLAN)"
    Write-Output "SPECS_DIR: $($paths.FEATURE_DIR)"
    Write-Output "BRANCH: $($paths.CURRENT_BRANCH)"
    Write-Output "HAS_GIT: $($paths.HAS_GIT)"
}
