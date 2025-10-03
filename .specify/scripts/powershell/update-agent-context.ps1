#!/usr/bin/env pwsh

# Update agent context files with information from plan.md
#
# This script maintains AI agent context files by parsing feature specifications 
# and updating agent-specific configuration files with project information.
#
# MAIN FUNCTIONS:
# 1. Environment Validation
#    - Verifies git repository structure and branch information
#    - Checks for required plan.md files and templates
#    - Validates file permissions and accessibility
#
# 2. Plan Data Extraction
#    - Parses plan.md files to extract project metadata
#    - Identifies language/version, frameworks, databases, and project types
#    - Handles missing or incomplete specification data gracefully
#
# 3. Agent File Management
#    - Creates new agent context files from templates when needed
#    - Updates existing agent files with new project information
#    - Preserves manual additions and custom configurations
#    - Supports multiple AI agent formats and directory structures
#
# 4. Content Generation
#    - Generates language-specific build/test commands
#    - Creates appropriate project directory structures
#    - Updates technology stacks and recent changes sections
#    - Maintains consistent formatting and timestamps
#
# 5. Multi-Agent Support
#    - Handles agent-specific file paths and naming conventions
#    - Supports: Claude, Gemini, Copilot, Cursor, Qwen, opencode, Codex, Windsurf
#    - Can update single agents or all existing agent files
#    - Creates default Claude file if no agent files exist
#
# Usage: ./update-agent-context.ps1 [agent_type]
# Agent types: claude|gemini|copilot|cursor|qwen|opencode|codex|windsurf
# Leave empty to update all existing agent files

[CmdletBinding()]
param(
    [string]$AgentType = "",
    [switch]$Help
)

$ErrorActionPreference = 'Stop'

# Show help if requested
if ($Help) {
    Write-Output @"
Usage: update-agent-context.ps1 [OPTIONS] [agent_type]

Updates AI agent context files with project information from plan.md.

OPTIONS:
  -Help, -h           Show this help message

ARGUMENTS:
  agent_type          Specific agent to update (claude|gemini|copilot|cursor|qwen|opencode|codex|windsurf)
                      If not specified, updates all existing agent files

EXAMPLES:
  .\update-agent-context.ps1                    # Update all existing agent files
  .\update-agent-context.ps1 claude             # Update only Claude agent file
  .\update-agent-context.ps1 cursor             # Update only Cursor agent file

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

# Validate required files
if (-not (Test-Path $paths.IMPL_PLAN -PathType Leaf)) {
    Write-Output "ERROR: plan.md not found in $($paths.FEATURE_DIR)"
    Write-Output "Run /plan first to create the implementation plan."
    exit 1
}

# Function to extract project information from plan.md
function Get-ProjectInfo {
    param([string]$PlanPath)
    
    $content = Get-Content $PlanPath -Raw
    $info = @{
        Language = "Unknown"
        Version = ""
        Framework = ""
        Database = ""
        ProjectType = "Unknown"
        BuildCommand = ""
        TestCommand = ""
        TechStack = @()
    }
    
    # Extract language and version
    if ($content -match 'Language[:\s]+([^\n\r]+)') {
        $info.Language = $matches[1].Trim()
    }
    if ($content -match 'Version[:\s]+([^\n\r]+)') {
        $info.Version = $matches[1].Trim()
    }
    
    # Extract framework
    if ($content -match 'Framework[:\s]+([^\n\r]+)') {
        $info.Framework = $matches[1].Trim()
    }
    
    # Extract database
    if ($content -match 'Database[:\s]+([^\n\r]+)') {
        $info.Database = $matches[1].Trim()
    }
    
    # Extract project type
    if ($content -match 'Project Type[:\s]+([^\n\r]+)') {
        $info.ProjectType = $matches[1].Trim()
    }
    
    # Extract tech stack
    if ($content -match 'Tech Stack[:\s]*\n((?:- [^\n\r]+\n?)+)') {
        $techStackLines = $matches[1] -split '\n' | Where-Object { $_ -match '^- ' }
        $info.TechStack = $techStackLines | ForEach-Object { $_.Substring(2).Trim() }
    }
    
    # Generate build and test commands based on language
    switch -Regex ($info.Language.ToLower()) {
        'javascript|typescript|node' {
            $info.BuildCommand = "npm run build"
            $info.TestCommand = "npm test"
        }
        'python' {
            $info.BuildCommand = "python -m build"
            $info.TestCommand = "python -m pytest"
        }
        'java' {
            $info.BuildCommand = "mvn clean package"
            $info.TestCommand = "mvn test"
        }
        'csharp|\.net' {
            $info.BuildCommand = "dotnet build"
            $info.TestCommand = "dotnet test"
        }
        'go' {
            $info.BuildCommand = "go build"
            $info.TestCommand = "go test"
        }
        'rust' {
            $info.BuildCommand = "cargo build"
            $info.TestCommand = "cargo test"
        }
        default {
            $info.BuildCommand = "make build"
            $info.TestCommand = "make test"
        }
    }
    
    return $info
}

# Function to generate agent context content
function New-AgentContextContent {
    param(
        [hashtable]$ProjectInfo,
        [string]$AgentType
    )
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $techStackList = if ($ProjectInfo.TechStack.Count -gt 0) { 
        $ProjectInfo.TechStack | ForEach-Object { "- $_" } | Out-String
    } else { 
        "- $($ProjectInfo.Language)" 
    }
    
    $content = @"
# Project Context for $AgentType

**Last Updated**: $timestamp
**Feature Branch**: $($paths.CURRENT_BRANCH)

## Project Information

- **Language**: $($ProjectInfo.Language)
- **Version**: $($ProjectInfo.Version)
- **Framework**: $($ProjectInfo.Framework)
- **Database**: $($ProjectInfo.Database)
- **Project Type**: $($ProjectInfo.ProjectType)

## Technology Stack

$techStackList

## Build and Test Commands

- **Build**: ``$($ProjectInfo.BuildCommand)``
- **Test**: ``$($ProjectInfo.TestCommand)``

## Project Structure

```
$($paths.REPO_ROOT)
├── .specify/                 # Spec Kit configuration
├── specs/                    # Feature specifications
│   └── $($paths.CURRENT_BRANCH)/
│       ├── spec.md          # Feature specification
│       ├── plan.md          # Implementation plan
│       └── tasks.md         # Task breakdown
├── frontend/                 # Frontend application (if applicable)
├── backend/                  # Backend application (if applicable)
└── docs/                     # Documentation
```

## Recent Changes

- **$timestamp**: Updated agent context for $AgentType
- **$timestamp**: Created feature specification for $($paths.CURRENT_BRANCH)

## Notes

This context file is automatically generated and updated by the Spec Kit workflow.
Manual modifications may be overwritten during updates.

"@
    
    return $content
}

# Function to update agent context file
function Update-AgentContext {
    param(
        [string]$AgentType,
        [hashtable]$ProjectInfo
    )
    
    # Define agent-specific file paths and naming conventions
    $agentPaths = @{
        'claude' = @(
            '.cursor/rules/claude-context.md',
            '.claude-context.md',
            'claude-context.md'
        )
        'gemini' = @(
            '.gemini-context.md',
            'gemini-context.md'
        )
        'copilot' = @(
            '.copilot-context.md',
            'copilot-context.md'
        )
        'cursor' = @(
            '.cursor/rules/cursor-context.md',
            '.cursor-context.md',
            'cursor-context.md'
        )
        'qwen' = @(
            '.qwen-context.md',
            'qwen-context.md'
        )
        'opencode' = @(
            '.opencode-context.md',
            'opencode-context.md'
        )
        'codex' = @(
            '.codex-context.md',
            'codex-context.md'
        )
        'windsurf' = @(
            '.windsurf-context.md',
            'windsurf-context.md'
        )
    }
    
    $paths = $agentPaths[$AgentType.ToLower()]
    if (-not $paths) {
        Write-Warning "Unknown agent type: $AgentType"
        return
    }
    
    # Find the first existing path or use the first one
    $targetPath = $null
    foreach ($path in $paths) {
        $fullPath = Join-Path $paths.REPO_ROOT $path
        if (Test-Path $fullPath) {
            $targetPath = $fullPath
            break
        }
    }
    
    if (-not $targetPath) {
        $targetPath = Join-Path $paths.REPO_ROOT $paths[0]
        # Create directory if it doesn't exist
        $targetDir = Split-Path $targetPath -Parent
        if (-not (Test-Path $targetDir)) {
            New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
        }
    }
    
    # Generate and write content
    $content = New-AgentContextContent -ProjectInfo $ProjectInfo -AgentType $AgentType
    Set-Content -Path $targetPath -Value $content -Encoding UTF8
    
    Write-Output "Updated $AgentType context file: $targetPath"
}

# Get project information
$projectInfo = Get-ProjectInfo -PlanPath $paths.IMPL_PLAN

# Determine which agents to update
$agentsToUpdate = @()

if ($AgentType) {
    $agentsToUpdate += $AgentType.ToLower()
} else {
    # Find all existing agent files
    $agentTypes = @('claude', 'gemini', 'copilot', 'cursor', 'qwen', 'opencode', 'codex', 'windsurf')
    foreach ($agent in $agentTypes) {
        $agentPaths = @{
            'claude' = @('.cursor/rules/claude-context.md', '.claude-context.md', 'claude-context.md')
            'gemini' = @('.gemini-context.md', 'gemini-context.md')
            'copilot' = @('.copilot-context.md', 'copilot-context.md')
            'cursor' = @('.cursor/rules/cursor-context.md', '.cursor-context.md', 'cursor-context.md')
            'qwen' = @('.qwen-context.md', 'qwen-context.md')
            'opencode' = @('.opencode-context.md', 'opencode-context.md')
            'codex' = @('.codex-context.md', 'codex-context.md')
            'windsurf' = @('.windsurf-context.md', 'windsurf-context.md')
        }
        
        $paths = $agentPaths[$agent]
        foreach ($path in $paths) {
            $fullPath = Join-Path $paths.REPO_ROOT $path
            if (Test-Path $fullPath) {
                $agentsToUpdate += $agent
                break
            }
        }
    }
    
    # If no existing agent files found, create a default Claude file
    if ($agentsToUpdate.Count -eq 0) {
        $agentsToUpdate += 'claude'
    }
}

# Update agent context files
foreach ($agent in $agentsToUpdate) {
    Update-AgentContext -AgentType $agent -ProjectInfo $projectInfo
}

Write-Output "Agent context update completed for: $($agentsToUpdate -join ', ')"
