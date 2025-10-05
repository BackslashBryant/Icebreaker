#!/usr/bin/env pwsh
# Common PowerShell helpers used by the Spec Kit prerequisite scripts.

function Get-RepoRoot {
    try {
        $root = git rev-parse --show-toplevel 2>$null
        if ($LASTEXITCODE -eq 0 -and $root) {
            return $root
        }
    } catch {
        # ignore
    }
    return (Resolve-Path (Join-Path $PSScriptRoot "../../.." )).Path
}

function Get-CurrentBranch {
    if ($env:SPECIFY_FEATURE) {
        return $env:SPECIFY_FEATURE
    }

    try {
        $branch = git rev-parse --abbrev-ref HEAD 2>$null
        if ($LASTEXITCODE -eq 0 -and $branch) {
            return $branch
        }
    } catch {
        # ignore
    }

    $repoRoot = Get-RepoRoot
    $specsDir = Join-Path $repoRoot 'specs'
    if (Test-Path $specsDir) {
        $latest = Get-ChildItem -Path $specsDir -Directory |
            Where-Object { $_.Name -match '^(\d{3})-' } |
            Sort-Object { [int]($_.Name.Substring(0,3)) } -Descending |
            Select-Object -First 1
        if ($latest) {
            return $latest.Name
        }
    }

    return 'main'
}

function Test-HasGit {
    try {
        git rev-parse --show-toplevel 2>$null | Out-Null
        return ($LASTEXITCODE -eq 0)
    } catch {
        return $false
    }
}

function Test-FeatureBranch {
    param(
        [string]$Branch,
        [bool]$HasGit = $true
    )

    if (-not $HasGit) {
        Write-Warning '[specify] Git repository not detected; branch validation skipped.'
        return $true
    }

    if ($Branch -notmatch '^[0-9]{3}-') {
        Write-Output "ERROR: Not on a feature branch. Current branch: $Branch"
        Write-Output 'Feature branches should be named like: 001-feature-name'
        return $false
    }

    return $true
}

function Get-FeatureDir {
    param(
        [string]$RepoRoot,
        [string]$Branch
    )
    Join-Path $RepoRoot "specs/$Branch"
}

function Get-FeaturePathsEnv {
    $repoRoot = Get-RepoRoot
    $currentBranch = Get-CurrentBranch
    $hasGit = Test-HasGit
    $featureDir = Get-FeatureDir -RepoRoot $repoRoot -Branch $currentBranch

    [PSCustomObject]@{
        REPO_ROOT      = $repoRoot
        CURRENT_BRANCH = $currentBranch
        HAS_GIT        = $hasGit
        FEATURE_DIR    = $featureDir
        FEATURE_SPEC   = Join-Path $featureDir 'spec.md'
        IMPL_PLAN      = Join-Path $featureDir 'plan.md'
        TASKS          = Join-Path $featureDir 'tasks.md'
        RESEARCH       = Join-Path $featureDir 'research.md'
        DATA_MODEL     = Join-Path $featureDir 'data-model.md'
        QUICKSTART     = Join-Path $featureDir 'quickstart.md'
        CONTRACTS_DIR  = Join-Path $featureDir 'contracts'
    }
}

function Write-CheckLine {
    param(
        [string]$Label,
        [bool]$Exists
    )

    $icon = if ($Exists) { '[x]' } else { '[ ]' }
    Write-Output "  $icon $Label"
    return $Exists
}

function Test-FileExists {
    param([string]$Path, [string]$Description)
    $exists = Test-Path -Path $Path -PathType Leaf
    return Write-CheckLine -Label $Description -Exists $exists
}

function Test-DirHasFiles {
    param([string]$Path, [string]$Description)
    $exists = (Test-Path -Path $Path -PathType Container) -and (
        Get-ChildItem -Path $Path -ErrorAction SilentlyContinue |
            Where-Object { -not $_.PSIsContainer } |
            Select-Object -First 1
    )
    return Write-CheckLine -Label $Description -Exists $exists
}