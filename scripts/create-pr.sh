#!/bin/bash

# Create Pull Request Script
# Provides fallback for GitHub MCP PR creation

set -e

# Configuration
REPO_OWNER="${GITHUB_REPO_OWNER:-your-username}"
REPO_NAME="${GITHUB_REPO_NAME:-my-project}"

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

# Check if GitHub CLI is available
check_gh_cli() {
    if ! command -v gh &> /dev/null; then
        log_error "GitHub CLI (gh) is not installed"
        log_info "Please install GitHub CLI: https://cli.github.com/"
        exit 1
    fi
    
    # Check if authenticated
    if ! gh auth status &> /dev/null; then
        log_error "Not authenticated with GitHub CLI"
        log_info "Please run: gh auth login"
        exit 1
    fi
}

# Check if git is available and in repository
check_git() {
    if ! command -v git &> /dev/null; then
        log_error "Git is not installed"
        exit 1
    fi
    
    # Check if we're in a git repository
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        log_error "Not in a git repository"
        exit 1
    fi
}

# Create pull request
create_pull_request() {
    local title="$1"
    local description="$2"
    local head_branch="$3"
    local base_branch="${4:-main}"
    local labels="$5"
    local assignee="$6"
    local draft="$7"
    
    log_info "Creating pull request: ${title}"
    
    # Build gh command
    local cmd="gh pr create --title \"${title}\" --body \"${description}\" --head \"${head_branch}\" --base \"${base_branch}\""
    
    # Add labels if provided
    if [ -n "${labels}" ]; then
        cmd="${cmd} --label \"${labels}\""
    fi
    
    # Add assignee if provided
    if [ -n "${assignee}" ]; then
        cmd="${cmd} --assignee \"${assignee}\""
    fi
    
    # Add draft flag if requested
    if [ "${draft}" = "true" ]; then
        cmd="${cmd} --draft"
    fi
    
    # Execute command
    local pr_url
    pr_url=$(eval "${cmd}")
    
    if [ $? -eq 0 ]; then
        log_success "Created pull request: ${pr_url}"
        echo "${pr_url}"
    else
        log_error "Failed to create pull request"
        return 1
    fi
}

# Create PR from current branch
create_pr_from_current() {
    local title="$1"
    local description="$2"
    local base_branch="${3:-main}"
    local labels="$4"
    local assignee="$5"
    local draft="$6"
    
    # Get current branch
    local current_branch
    current_branch=$(git branch --show-current)
    
    if [ -z "${current_branch}" ]; then
        log_error "Could not determine current branch"
        exit 1
    fi
    
    log_info "Creating PR from current branch: ${current_branch}"
    
    create_pull_request "${title}" "${description}" "${current_branch}" "${base_branch}" "${labels}" "${assignee}" "${draft}"
}

# Create PR from template
create_pr_from_template() {
    local template_file="$1"
    local title="$2"
    local head_branch="$3"
    local base_branch="${4:-main}"
    local labels="$5"
    local assignee="$6"
    local draft="$7"
    
    if [ ! -f "${template_file}" ]; then
        log_error "Template file not found: ${template_file}"
        return 1
    fi
    
    # Read template content
    local description
    description=$(cat "${template_file}")
    
    # Create PR
    create_pull_request "${title}" "${description}" "${head_branch}" "${base_branch}" "${labels}" "${assignee}" "${draft}"
}

# List pull requests
list_pull_requests() {
    local state="${1:-open}"
    
    log_info "Listing ${state} pull requests"
    
    gh pr list --state "${state}" --json number,title,headRefName,baseRefName,author,createdAt,url --jq '.[] | "\(.number): \(.title) (\(.headRefName) -> \(.baseRefName)) by \(.author.login) - \(.url)"'
}

# Get PR details
get_pr_details() {
    local pr_number="$1"
    
    log_info "Getting details for PR #${pr_number}"
    
    gh pr view "${pr_number}" --json number,title,body,headRefName,baseRefName,author,state,url,mergeable,reviewDecision
}

# Merge pull request
merge_pull_request() {
    local pr_number="$1"
    local merge_method="${2:-squash}"
    local delete_branch="${3:-true}"
    
    log_info "Merging PR #${pr_number} using ${merge_method} method"
    
    # Build merge command
    local cmd="gh pr merge \"${pr_number}\" --${merge_method}"
    
    if [ "${delete_branch}" = "true" ]; then
        cmd="${cmd} --delete-branch"
    fi
    
    # Execute merge command
    eval "${cmd}"
    
    if [ $? -eq 0 ]; then
        log_success "Merged PR #${pr_number}"
    else
        log_error "Failed to merge PR #${pr_number}"
        return 1
    fi
}

# Main function
main() {
    local command="$1"
    
    case "$command" in
        "create")
            check_gh_cli
            check_git
            create_pull_request "$2" "$3" "$4" "$5" "$6" "$7" "$8"
            ;;
        "create-from-current")
            check_gh_cli
            check_git
            create_pr_from_current "$2" "$3" "$4" "$5" "$6" "$7"
            ;;
        "create-from-template")
            check_gh_cli
            check_git
            create_pr_from_template "$2" "$3" "$4" "$5" "$6" "$7" "$8"
            ;;
        "list")
            check_gh_cli
            list_pull_requests "$2"
            ;;
        "view")
            check_gh_cli
            get_pr_details "$2"
            ;;
        "merge")
            check_gh_cli
            merge_pull_request "$2" "$3" "$4"
            ;;
        *)
            echo "Usage: $0 {create|create-from-current|create-from-template|list|view|merge}"
            echo ""
            echo "Commands:"
            echo "  create <title> <desc> <head> [base] [labels] [assignee] [draft]"
            echo "  create-from-current <title> <desc> [base] [labels] [assignee] [draft]"
            echo "  create-from-template <template> <title> <head> [base] [labels] [assignee] [draft]"
            echo "  list [state]"
            echo "  view <pr-number>"
            echo "  merge <pr-number> [method] [delete-branch]"
            echo ""
            echo "Examples:"
            echo "  $0 create-from-current \"Fix login bug\" \"Fixes authentication issue\" main \"bug,priority:high\" \"@me\""
            echo "  $0 create-from-template \".github/PULL_REQUEST_TEMPLATE.md\" \"New feature\" feat/123-auth main"
            echo "  $0 list open"
            echo "  $0 view 123"
            echo "  $0 merge 123 squash true"
            echo ""
            echo "Environment variables:"
            echo "  GITHUB_REPO_OWNER                  Repository owner (default: your-username)"
            echo "  GITHUB_REPO_NAME                   Repository name (default: my-project)"
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"