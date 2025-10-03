#!/usr/bin/env pwsh

[CmdletBinding()]
param(
    [switch]$Json,
    [switch]$Help,
    [Parameter(ValueFromRemainingArguments=$true)]
    [string[]]$FeatureDescription
)

$ErrorActionPreference = 'Stop'

# Show help if requested
if ($Help) {
    Write-Output @"
Usage: create-new-feature.ps1 [OPTIONS] <feature_description>

Creates a new feature branch and specification file.

OPTIONS:
  -Json               Output results in JSON format
  -Help, -h           Show this help message

EXAMPLES:
  .\create-new-feature.ps1 "Build a task management system"
  .\create-new-feature.ps1 -Json "Add user authentication"

"@
    exit 0
}

# Join remaining arguments into feature description
$FEATURE_DESCRIPTION = $FeatureDescription -join ' '

if ([string]::IsNullOrWhiteSpace($FEATURE_DESCRIPTION)) {
    Write-Output "Usage: create-new-feature.ps1 [OPTIONS] <feature_description>" >&2
    exit 1
}

# Function to find the repository root by searching for existing project markers
function Find-RepoRoot {
    param([string]$StartDir)
    
    $dir = $StartDir
    while ($dir -ne $null -and $dir -ne [System.IO.Path]::GetPathRoot($dir)) {
        if ((Test-Path (Join-Path $dir '.git')) -or (Test-Path (Join-Path $dir '.specify'))) {
            return $dir
        }
        $dir = Split-Path $dir -Parent
    }
    return $null
}

# Resolve repository root. Prefer git information when available, but fall back
# to searching for repository markers so the workflow still functions in repositories that
# were initialised with --no-git.
$SCRIPT_DIR = $PSScriptRoot

try {
    $REPO_ROOT = git rev-parse --show-toplevel 2>$null
    if ($LASTEXITCODE -eq 0) {
        $HAS_GIT = $true
    } else {
        throw "Git command failed"
    }
} catch {
    $REPO_ROOT = Find-RepoRoot -StartDir $SCRIPT_DIR
    if (-not $REPO_ROOT) {
        Write-Output "Error: Could not determine repository root. Please run this script from within the repository." >&2
        exit 1
    }
    $HAS_GIT = $false
}

Set-Location $REPO_ROOT

$SPECS_DIR = Join-Path $REPO_ROOT "specs"
if (-not (Test-Path $SPECS_DIR)) {
    New-Item -ItemType Directory -Path $SPECS_DIR -Force | Out-Null
}

$HIGHEST = 0
if (Test-Path $SPECS_DIR) {
    Get-ChildItem -Path $SPECS_DIR -Directory | ForEach-Object {
        $dirname = $_.Name
        if ($dirname -match '^(\d+)') {
            $number = [int]$matches[1]
            if ($number -gt $HIGHEST) { 
                $HIGHEST = $number 
            }
        }
    }
}

$NEXT = $HIGHEST + 1
$FEATURE_NUM = "{0:D3}" -f $NEXT

# Convert feature description to branch name
$BRANCH_NAME = $FEATURE_DESCRIPTION.ToLower() -replace '[^a-z0-9]', '-' -replace '-+', '-' -replace '^-|-$', ''
$WORDS = ($BRANCH_NAME -split '-' | Where-Object { $_ -ne '' } | Select-Object -First 3) -join '-'
$BRANCH_NAME = "$FEATURE_NUM-$WORDS"

if ($HAS_GIT) {
    try {
        git checkout -b $BRANCH_NAME 2>$null
        if ($LASTEXITCODE -ne 0) {
            Write-Warning "Failed to create git branch: $BRANCH_NAME"
        }
    } catch {
        Write-Warning "Failed to create git branch: $BRANCH_NAME"
    }
} else {
    Write-Warning "[specify] Warning: Git repository not detected; skipped branch creation for $BRANCH_NAME"
}

$FEATURE_DIR = Join-Path $SPECS_DIR $BRANCH_NAME
if (-not (Test-Path $FEATURE_DIR)) {
    New-Item -ItemType Directory -Path $FEATURE_DIR -Force | Out-Null
}

$TEMPLATE = Join-Path $REPO_ROOT ".specify/templates/spec-template.md"
$SPEC_FILE = Join-Path $FEATURE_DIR "spec.md"

if (Test-Path $TEMPLATE) {
    Copy-Item $TEMPLATE $SPEC_FILE
} else {
    New-Item -ItemType File -Path $SPEC_FILE -Force | Out-Null
}

# Set the SPECIFY_FEATURE environment variable for the current session
$env:SPECIFY_FEATURE = $BRANCH_NAME

if ($Json) {
    [PSCustomObject]@{
        BRANCH_NAME = $BRANCH_NAME
        SPEC_FILE = $SPEC_FILE
        FEATURE_NUM = $FEATURE_NUM
    } | ConvertTo-Json -Compress
} else {
    Write-Output "BRANCH_NAME: $BRANCH_NAME"
    Write-Output "SPEC_FILE: $SPEC_FILE"
    Write-Output "FEATURE_NUM: $FEATURE_NUM"
    Write-Output "SPECIFY_FEATURE environment variable set to: $BRANCH_NAME"
}
