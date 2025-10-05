#!/usr/bin/env pwsh

# Consolidated prerequisite checking script (PowerShell)
#
# This script provides unified prerequisite checking for Spec-Driven Development workflow.
# It replaces the functionality previously spread across multiple scripts.
#
# Usage: ./check-prerequisites.ps1 [OPTIONS]
#
# OPTIONS:
#   -Json               Output in JSON format
#   -RequireTasks       Require tasks.md to exist (for implementation phase)
#   -IncludeTasks       Include tasks.md in AVAILABLE_DOCS list
#   -PathsOnly          Only output path variables (no validation)
#   -Help, -h           Show help message

[CmdletBinding()]
param(
    [switch]$Json,
    [switch]$RequireTasks,
    [switch]$IncludeTasks,
    [switch]$PathsOnly,
    [switch]$Help
)

$ErrorActionPreference = 'Stop'

# Show help if requested
if ($Help) {
    Write-Output @"
Usage: check-prerequisites.ps1 [OPTIONS]

Consolidated prerequisite checking for Spec-Driven Development workflow.

OPTIONS:
  -Json               Output in JSON format
  -RequireTasks       Require tasks.md to exist (for implementation phase)
  -IncludeTasks       Include tasks.md in AVAILABLE_DOCS list
  -PathsOnly          Only output path variables (no prerequisite validation)
  -Help, -h           Show this help message

EXAMPLES:
  # Check task prerequisites (plan.md required)
  .\check-prerequisites.ps1 -Json
  
  # Check implementation prerequisites (plan.md + tasks.md required)
  .\check-prerequisites.ps1 -Json -RequireTasks -IncludeTasks
  
  # Get feature paths only (no validation)
  .\check-prerequisites.ps1 -PathsOnly

"@
    exit 0
}

# Source common functions
. "$PSScriptRoot/common.ps1"

# Get feature paths and validate branch
$paths = Get-FeaturePathsEnv

if (-not (Test-FeatureBranch -Branch $paths.CURRENT_BRANCH -HasGit:$paths.HAS_GIT)) { 
    exit 1 
}

# Run global pre-flight checks once before returning early in paths-only mode
$preflightErrors = @()
$repoRoot = $paths.REPO_ROOT

# 1. Verify Spec Kit installation structure exists
$specKitRoot = Join-Path $repoRoot '.specify'
if (-not (Test-Path $specKitRoot -PathType Container)) {
    $preflightErrors += "Spec Kit directory not found. Run /specify setup before continuing."
}

# 2. Verify Cursor rules reference Spec Kit workflow
$workflowRule = Join-Path $repoRoot '.cursor/rules/01-workflow.mdc'
if (-not (Test-Path $workflowRule -PathType Leaf)) {
    $preflightErrors += "Workflow rule file missing (.cursor/rules/01-workflow.mdc)."
}

# 3. Validate MCP configuration contains required servers and no inline secrets
$mcpConfigPath = Join-Path $repoRoot '.cursor/mcp.json'
$requiredServers = @('github','supabase','playwright','docfork','desktop-commander')

if (-not (Test-Path $mcpConfigPath -PathType Leaf)) {
    $preflightErrors += "MCP configuration missing (.cursor/mcp.json)."
} else {
    try {
        $mcpJson = Get-Content -Path $mcpConfigPath -Raw | ConvertFrom-Json
        $servers = $mcpJson.mcpServers
        foreach ($name in $requiredServers) {
            if (-not $servers.PSObject.Properties.Name.Contains($name)) {
                $preflightErrors += "MCP server '$name' not configured."
            }
        }

        foreach ($property in $servers.PSObject.Properties) {
            $envConfig = $property.Value.env
            if ($envConfig) {
                foreach ($envVar in $envConfig.PSObject.Properties) {
                    $value = [string]$envVar.Value
                    if ($value -and ($value -notmatch '\$\{inputs\.') -and ($value -notmatch '\$\{env\.') ) {
                        $preflightErrors += "Environment variable '$($envVar.Name)' for MCP server '$($property.Name)' contains inline value. Use inputs or external env vars instead."
                    }
                }
            }
        }
    } catch {
        $preflightErrors += "Unable to parse .cursor/mcp.json: $($_.Exception.Message)"
    }
}

if ($preflightErrors.Count -gt 0 -and -not $PathsOnly) {
    foreach ($message in $preflightErrors) {
        Write-Output "ERROR: $message"
    }
    exit 1
}

# If paths-only mode, output paths and exit (support combined -Json -PathsOnly)
if ($PathsOnly) {
    if ($Json) {
        [PSCustomObject]@{
            REPO_ROOT    = $paths.REPO_ROOT
            BRANCH       = $paths.CURRENT_BRANCH
            FEATURE_DIR  = $paths.FEATURE_DIR
            FEATURE_SPEC = $paths.FEATURE_SPEC
            IMPL_PLAN    = $paths.IMPL_PLAN
            TASKS        = $paths.TASKS
        } | ConvertTo-Json -Compress
    } else {
        Write-Output "REPO_ROOT: $($paths.REPO_ROOT)"
        Write-Output "BRANCH: $($paths.CURRENT_BRANCH)"
        Write-Output "FEATURE_DIR: $($paths.FEATURE_DIR)"
        Write-Output "FEATURE_SPEC: $($paths.FEATURE_SPEC)"
        Write-Output "IMPL_PLAN: $($paths.IMPL_PLAN)"
        Write-Output "TASKS: $($paths.TASKS)"
    }
    exit 0
}

# Validate required directories and files
$featureExists = Test-Path $paths.FEATURE_DIR -PathType Container
$onFeatureBranch = $paths.CURRENT_BRANCH -match '^[0-9]{3}-'

if (-not $featureExists) {
    if ($onFeatureBranch) {
        Write-Output "ERROR: Feature directory not found: $($paths.FEATURE_DIR)"
        Write-Output "Run /specify first to create the feature structure."
        exit 1
    }

    Write-Output "INFO: No Spec Kit feature directory found yet."
} else {
    if (-not (Test-Path $paths.IMPL_PLAN -PathType Leaf)) {
        Write-Output "ERROR: plan.md not found in $($paths.FEATURE_DIR)"
        Write-Output "Run /plan first to create the implementation plan."
        exit 1
    }
}

# Check for tasks.md if required
if ($RequireTasks -and $onFeatureBranch -and -not (Test-Path $paths.TASKS -PathType Leaf)) {
    Write-Output "ERROR: tasks.md not found in $($paths.FEATURE_DIR)"
    Write-Output "Run /tasks first to create the task list."
    exit 1
}
if ($RequireTasks -and -not (Test-Path $paths.TASKS -PathType Leaf)) {
    Write-Output "ERROR: tasks.md not found in $($paths.FEATURE_DIR)"
    Write-Output "Run /tasks first to create the task list."
    exit 1
}

# Build list of available documents
$docs = @()

# Always check these optional docs
if (Test-Path $paths.RESEARCH) { $docs += 'research.md' }
if (Test-Path $paths.DATA_MODEL) { $docs += 'data-model.md' }

# Check contracts directory (only if it exists and has files)
if ((Test-Path $paths.CONTRACTS_DIR) -and (Get-ChildItem -Path $paths.CONTRACTS_DIR -ErrorAction SilentlyContinue | Select-Object -First 1)) { 
    $docs += 'contracts/' 
}

if (Test-Path $paths.QUICKSTART) { $docs += 'quickstart.md' }

# Include tasks.md if requested and it exists
if ($IncludeTasks -and (Test-Path $paths.TASKS)) { 
    $docs += 'tasks.md' 
}

# Output results
if ($Json) {
    # JSON output
    [PSCustomObject]@{ 
        FEATURE_DIR = $paths.FEATURE_DIR
        AVAILABLE_DOCS = $docs 
    } | ConvertTo-Json -Compress
} else {
    # Text output
    Write-Output "FEATURE_DIR:$($paths.FEATURE_DIR)"
    Write-Output "AVAILABLE_DOCS:"
    
    # Show status of each potential document
    Test-FileExists -Path $paths.RESEARCH -Description 'research.md' | Out-Null
    Test-FileExists -Path $paths.DATA_MODEL -Description 'data-model.md' | Out-Null
    Test-DirHasFiles -Path $paths.CONTRACTS_DIR -Description 'contracts/' | Out-Null
    Test-FileExists -Path $paths.QUICKSTART -Description 'quickstart.md' | Out-Null
    
    if ($IncludeTasks) {
        Test-FileExists -Path $paths.TASKS -Description 'tasks.md' | Out-Null
    }
}