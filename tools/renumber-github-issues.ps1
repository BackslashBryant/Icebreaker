# GitHub Issue Renumbering Script

**Purpose**: Create new GitHub issues #1-12 and close old issues with migration comments

**Usage**: Run this script after verifying all local references are updated

```powershell
# Load GitHub token from .env
$token = (Get-Content .env | Select-String "^GITHUB_TOKEN=" | ForEach-Object { $_.Line.Split('=', 2)[1].Trim('"''') })
$headers = @{
    "Authorization" = "Bearer $token"
    "Accept" = "application/vnd.github+json"
    "X-GitHub-Api-Version" = "2022-11-28"
}

$repo = "BackslashBryant/Icebreaker"

# Issue mapping: Old → New
$issueMapping = @{
    2 = 1   # Radar View
    3 = 2   # Chat Interface
    5 = 3   # Panic Button
    6 = 4   # Block/Report
    7 = 5   # Profile/Settings
    8 = 6   # Chat Request Cooldowns
    9 = 7   # UX Review Fixes
    10 = 8  # Persona-Based Testing
    18 = 9  # Persona-Simulated Testing
    20 = 10 # Performance Verification
    21 = 11 # Production Deployment
    22 = 12 # Monitoring & Error Tracking
}

# Step 1: Get existing issue details
Write-Host "Fetching existing issue details..."
$existingIssues = @{}
foreach ($oldNum in $issueMapping.Keys) {
    try {
        $issue = Invoke-RestMethod -Uri "https://api.github.com/repos/$repo/issues/$oldNum" -Headers $headers
        $existingIssues[$oldNum] = $issue
        Write-Host "✅ Fetched Issue #$oldNum : $($issue.title)"
    } catch {
        Write-Host "⚠️  Issue #$oldNum not found or inaccessible"
    }
}

# Step 2: Create new issues with migrated content
Write-Host "`nCreating new issues..."
$newIssues = @{}
foreach ($oldNum in $issueMapping.Keys) {
    $newNum = $issueMapping[$oldNum]
    if ($existingIssues.ContainsKey($oldNum)) {
        $oldIssue = $existingIssues[$oldNum]
        
        # Create new issue body with migration note
        $newBody = @"
**Migrated from Issue #$oldNum**

$($oldIssue.body)

---

**Migration Note**: This issue was renumbered from Issue #$oldNum to Issue #$newNum on 2025-11-11 as part of issue renumbering to eliminate gaps.
"@
        
        $newIssueBody = @{
            title = $oldIssue.title
            body = $newBody
            labels = $oldIssue.labels | ForEach-Object { $_.name }
        } | ConvertTo-Json -Depth 10
        
        try {
            $newIssue = Invoke-RestMethod -Uri "https://api.github.com/repos/$repo/issues" -Method Post -Headers $headers -Body $newIssueBody -ContentType "application/json"
            $newIssues[$newNum] = $newIssue
            Write-Host "✅ Created Issue #$newNum : $($newIssue.title)"
        } catch {
            Write-Host "❌ Failed to create Issue #$newNum : $($_.Exception.Message)"
        }
    }
}

# Step 3: Close old issues with migration comments
Write-Host "`nClosing old issues with migration comments..."
foreach ($oldNum in $issueMapping.Keys) {
    $newNum = $issueMapping[$oldNum]
    if ($existingIssues.ContainsKey($oldNum) -and $newIssues.ContainsKey($newNum)) {
        $migrationComment = @"
## Issue Renumbered

This issue has been renumbered to **Issue #$newNum**.

**New Issue**: https://github.com/$repo/issues/$newNum

**Migration Date**: 2025-11-11  
**Reason**: Issue renumbering to eliminate gaps and improve organization

Please refer to Issue #$newNum for all future updates and discussions.
"@
        
        $commentBody = @{
            body = $migrationComment
        } | ConvertTo-Json
        
        try {
            # Add migration comment
            Invoke-RestMethod -Uri "https://api.github.com/repos/$repo/issues/$oldNum/comments" -Method Post -Headers $headers -Body $commentBody -ContentType "application/json" | Out-Null
            
            # Close the issue
            $closeBody = @{
                state = "closed"
                state_reason = "not_planned"
            } | ConvertTo-Json
            
            Invoke-RestMethod -Uri "https://api.github.com/repos/$repo/issues/$oldNum" -Method Patch -Headers $headers -Body $closeBody -ContentType "application/json" | Out-Null
            Write-Host "✅ Closed Issue #$oldNum (migrated to #$newNum)"
        } catch {
            Write-Host "❌ Failed to close Issue #$oldNum : $($_.Exception.Message)"
        }
    }
}

Write-Host "`n✨ Migration complete!"
Write-Host "`nNew Issues Created:"
foreach ($newNum in $newIssues.Keys | Sort-Object) {
    $issue = $newIssues[$newNum]
    Write-Host "  Issue #$newNum : $($issue.title) - $($issue.html_url)"
}
```

**Note**: This script requires:
- GitHub token with `repo`, `issues` scopes
- Existing issues to be accessible
- Manual review before execution

**Alternative**: Use GitHub web UI to:
1. Create new issues manually
2. Copy content from old issues
3. Add migration comments to old issues
4. Close old issues



**Purpose**: Create new GitHub issues #1-12 and close old issues with migration comments

**Usage**: Run this script after verifying all local references are updated

```powershell
# Load GitHub token from .env
$token = (Get-Content .env | Select-String "^GITHUB_TOKEN=" | ForEach-Object { $_.Line.Split('=', 2)[1].Trim('"''') })
$headers = @{
    "Authorization" = "Bearer $token"
    "Accept" = "application/vnd.github+json"
    "X-GitHub-Api-Version" = "2022-11-28"
}

$repo = "BackslashBryant/Icebreaker"

# Issue mapping: Old → New
$issueMapping = @{
    2 = 1   # Radar View
    3 = 2   # Chat Interface
    5 = 3   # Panic Button
    6 = 4   # Block/Report
    7 = 5   # Profile/Settings
    8 = 6   # Chat Request Cooldowns
    9 = 7   # UX Review Fixes
    10 = 8  # Persona-Based Testing
    18 = 9  # Persona-Simulated Testing
    20 = 10 # Performance Verification
    21 = 11 # Production Deployment
    22 = 12 # Monitoring & Error Tracking
}

# Step 1: Get existing issue details
Write-Host "Fetching existing issue details..."
$existingIssues = @{}
foreach ($oldNum in $issueMapping.Keys) {
    try {
        $issue = Invoke-RestMethod -Uri "https://api.github.com/repos/$repo/issues/$oldNum" -Headers $headers
        $existingIssues[$oldNum] = $issue
        Write-Host "✅ Fetched Issue #$oldNum : $($issue.title)"
    } catch {
        Write-Host "⚠️  Issue #$oldNum not found or inaccessible"
    }
}

# Step 2: Create new issues with migrated content
Write-Host "`nCreating new issues..."
$newIssues = @{}
foreach ($oldNum in $issueMapping.Keys) {
    $newNum = $issueMapping[$oldNum]
    if ($existingIssues.ContainsKey($oldNum)) {
        $oldIssue = $existingIssues[$oldNum]
        
        # Create new issue body with migration note
        $newBody = @"
**Migrated from Issue #$oldNum**

$($oldIssue.body)

---

**Migration Note**: This issue was renumbered from Issue #$oldNum to Issue #$newNum on 2025-11-11 as part of issue renumbering to eliminate gaps.
"@
        
        $newIssueBody = @{
            title = $oldIssue.title
            body = $newBody
            labels = $oldIssue.labels | ForEach-Object { $_.name }
        } | ConvertTo-Json -Depth 10
        
        try {
            $newIssue = Invoke-RestMethod -Uri "https://api.github.com/repos/$repo/issues" -Method Post -Headers $headers -Body $newIssueBody -ContentType "application/json"
            $newIssues[$newNum] = $newIssue
            Write-Host "✅ Created Issue #$newNum : $($newIssue.title)"
        } catch {
            Write-Host "❌ Failed to create Issue #$newNum : $($_.Exception.Message)"
        }
    }
}

# Step 3: Close old issues with migration comments
Write-Host "`nClosing old issues with migration comments..."
foreach ($oldNum in $issueMapping.Keys) {
    $newNum = $issueMapping[$oldNum]
    if ($existingIssues.ContainsKey($oldNum) -and $newIssues.ContainsKey($newNum)) {
        $migrationComment = @"
## Issue Renumbered

This issue has been renumbered to **Issue #$newNum**.

**New Issue**: https://github.com/$repo/issues/$newNum

**Migration Date**: 2025-11-11  
**Reason**: Issue renumbering to eliminate gaps and improve organization

Please refer to Issue #$newNum for all future updates and discussions.
"@
        
        $commentBody = @{
            body = $migrationComment
        } | ConvertTo-Json
        
        try {
            # Add migration comment
            Invoke-RestMethod -Uri "https://api.github.com/repos/$repo/issues/$oldNum/comments" -Method Post -Headers $headers -Body $commentBody -ContentType "application/json" | Out-Null
            
            # Close the issue
            $closeBody = @{
                state = "closed"
                state_reason = "not_planned"
            } | ConvertTo-Json
            
            Invoke-RestMethod -Uri "https://api.github.com/repos/$repo/issues/$oldNum" -Method Patch -Headers $headers -Body $closeBody -ContentType "application/json" | Out-Null
            Write-Host "✅ Closed Issue #$oldNum (migrated to #$newNum)"
        } catch {
            Write-Host "❌ Failed to close Issue #$oldNum : $($_.Exception.Message)"
        }
    }
}

Write-Host "`n✨ Migration complete!"
Write-Host "`nNew Issues Created:"
foreach ($newNum in $newIssues.Keys | Sort-Object) {
    $issue = $newIssues[$newNum]
    Write-Host "  Issue #$newNum : $($issue.title) - $($issue.html_url)"
}
```

**Note**: This script requires:
- GitHub token with `repo`, `issues` scopes
- Existing issues to be accessible
- Manual review before execution

**Alternative**: Use GitHub web UI to:
1. Create new issues manually
2. Copy content from old issues
3. Add migration comments to old issues
4. Close old issues

