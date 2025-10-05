#!/bin/bash

# Git Automation Script
# Provides fallback for GitHub MCP operations

set -e

# Configuration
REPO_OWNER="${GITHUB_REPO_OWNER:-your-username}"
REPO_NAME="${GITHUB_REPO_NAME:-my-project}"
BRANCH_PREFIX="${BRANCH_PREFIX:-feat}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are available
check_dependencies() {
    local missing_deps=()
    
    if ! command -v git &> /dev/null; then
        missing_deps+=("git")
    fi
    
    if ! command -v gh &> /dev/null; then
        missing_deps+=("gh (GitHub CLI)")
    fi
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        log_error "Missing required dependencies: ${missing_deps[*]}"
        log_info "Please install the missing dependencies and try again."
        exit 1
    fi
}

# Create a new branch
create_branch() {
    local issue_id="$1"
    local slug="$2"
    local branch_name="${BRANCH_PREFIX}/${issue_id}-${slug}"
    
    log_info "Creating branch: ${branch_name}"
    
    # Check if branch already exists
    if git show-ref --verify --quiet "refs/heads/${branch_name}"; then
        log_warning "Branch ${branch_name} already exists"
        git checkout "${branch_name}"
        return 0
    fi
    
    # Create and checkout new branch
    git checkout -b "${branch_name}"
    log_success "Created and checked out branch: ${branch_name}"
}

# Commit changes
commit_changes() {
    local issue_id="$1"
    local message="$2"
    local commit_message="feat: ${message} (fixes #${issue_id})"
    
    log_info "Committing changes: ${commit_message}"
    
    # Add all changes
    git add .
    
    # Check if there are changes to commit
    if git diff --staged --quiet; then
        log_warning "No changes to commit"
        return 0
    fi
    
    # Commit changes
    git commit -m "${commit_message}"
    log_success "Committed changes: ${commit_message}"
}

# Push branch to remote
push_branch() {
    local branch_name="$(git branch --show-current)"
    
    log_info "Pushing branch: ${branch_name}"
    
    # Push branch to remote
    git push -u origin "${branch_name}"
    log_success "Pushed branch: ${branch_name}"
}

# Create pull request
create_pull_request() {
    local issue_id="$1"
    local title="$2"
    local description="$3"
    local branch_name="$(git branch --show-current)"
    
    log_info "Creating pull request for branch: ${branch_name}"
    
    # Create PR using GitHub CLI
    local pr_url
    pr_url=$(gh pr create \
        --title "${title}" \
        --body "${description}" \
        --head "${branch_name}" \
        --base "main" \
        --assignee "@me" \
        --label "enhancement" \
        --label "automated")
    
    if [ $? -eq 0 ]; then
        log_success "Created pull request: ${pr_url}"
        echo "${pr_url}"
    else
        log_error "Failed to create pull request"
        return 1
    fi
}

# Merge pull request
merge_pull_request() {
    local pr_number="$1"
    
    log_info "Merging pull request: #${pr_number}"
    
    # Merge PR using GitHub CLI
    gh pr merge "${pr_number}" --squash --delete-branch
    
    if [ $? -eq 0 ]; then
        log_success "Merged pull request: #${pr_number}"
    else
        log_error "Failed to merge pull request: #${pr_number}"
        return 1
    fi
}

# Switch back to main and pull latest
switch_to_main() {
    log_info "Switching to main branch and pulling latest"
    
    git checkout main
    git pull origin main
    
    log_success "Switched to main and pulled latest changes"
}

# Complete git workflow
complete_workflow() {
    local issue_id="$1"
    local slug="$2"
    local title="$3"
    local description="$4"
    
    log_info "Starting complete git workflow for issue #${issue_id}"
    
    # Check dependencies
    check_dependencies
    
    # Create branch
    create_branch "${issue_id}" "${slug}"
    
    # Commit changes (if any)
    commit_changes "${issue_id}" "${title}"
    
    # Push branch
    push_branch
    
    # Create pull request
    local pr_url
    pr_url=$(create_pull_request "${issue_id}" "${title}" "${description}")
    
    if [ $? -eq 0 ]; then
        # Extract PR number from URL
        local pr_number
        pr_number=$(echo "${pr_url}" | grep -o '[0-9]*$')
        
        # Merge pull request
        merge_pull_request "${pr_number}"
        
        # Switch back to main
        switch_to_main
        
        log_success "Complete git workflow finished successfully"
        log_info "Pull request: ${pr_url}"
    else
        log_error "Git workflow failed at pull request creation"
        return 1
    fi
}

# Main function
main() {
    local command="$1"
    
    case "$command" in
        "create-branch")
            create_branch "$2" "$3"
            ;;
        "commit")
            commit_changes "$2" "$3"
            ;;
        "push")
            push_branch
            ;;
        "create-pr")
            create_pull_request "$2" "$3" "$4"
            ;;
        "merge-pr")
            merge_pull_request "$2"
            ;;
        "switch-main")
            switch_to_main
            ;;
        "complete")
            complete_workflow "$2" "$3" "$4" "$5"
            ;;
        *)
            echo "Usage: $0 {create-branch|commit|push|create-pr|merge-pr|switch-main|complete}"
            echo ""
            echo "Commands:"
            echo "  create-branch <issue-id> <slug>     Create a new feature branch"
            echo "  commit <issue-id> <message>         Commit changes with issue reference"
            echo "  push                                Push current branch to remote"
            echo "  create-pr <issue-id> <title> <desc> Create pull request"
            echo "  merge-pr <pr-number>                Merge pull request"
            echo "  switch-main                         Switch to main and pull latest"
            echo "  complete <issue-id> <slug> <title> <desc> Complete workflow"
            echo ""
            echo "Environment variables:"
            echo "  GITHUB_REPO_OWNER                  Repository owner (default: your-username)"
            echo "  GITHUB_REPO_NAME                   Repository name (default: my-project)"
            echo "  BRANCH_PREFIX                      Branch prefix (default: feat)"
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"