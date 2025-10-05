#!/usr/bin/env bash

# Consolidated prerequisite checking script
#
# This script provides unified prerequisite checking for Spec-Driven Development workflow.
# It replaces the functionality previously spread across multiple scripts.
#
# Usage: ./check-prerequisites.sh [OPTIONS]
#
# OPTIONS:
#   --json              Output in JSON format
#   --require-tasks     Require tasks.md to exist (for implementation phase)
#   --include-tasks     Include tasks.md in AVAILABLE_DOCS list
#   --paths-only        Only output path variables (no validation)
#   --help, -h          Show help message
#
# OUTPUTS:
#   JSON mode: {"FEATURE_DIR":"...", "AVAILABLE_DOCS":["..."]}
#   Text mode: FEATURE_DIR:... \\n AVAILABLE_DOCS: \\n */- file.md
#   Paths only: REPO_ROOT: ... \n BRANCH: ... \n FEATURE_DIR: ... etc.

set -euo pipefail

# Parse command line arguments
JSON_MODE=false
REQUIRE_TASKS=false
INCLUDE_TASKS=false
PATHS_ONLY=false

for arg in "$@"; do
    case "$arg" in
        --json)
            JSON_MODE=true
            ;;
        --require-tasks)
            REQUIRE_TASKS=true
            ;;
        --include-tasks)
            INCLUDE_TASKS=true
            ;;
        --paths-only)
            PATHS_ONLY=true
            ;;
        --help|-h)
            cat <<'EOF'
Usage: check-prerequisites.sh [OPTIONS]

Consolidated prerequisite checking for Spec-Driven Development workflow.

OPTIONS:
  --json              Output in JSON format
  --require-tasks     Require tasks.md to exist (for implementation phase)
  --include-tasks     Include tasks.md in AVAILABLE_DOCS list
  --paths-only        Only output path variables (no prerequisite validation)
  --help, -h          Show this help message

EXAMPLES:
  # Check task prerequisites (plan.md required)
  ./check-prerequisites.sh --json
  
  # Check implementation prerequisites (plan.md + tasks.md required)
  ./check-prerequisites.sh --json --require-tasks --include-tasks
  
  # Get feature paths only (no validation)
  ./check-prerequisites.sh --paths-only
  
EOF
            exit 0
            ;;
        *)
            echo "ERROR: Unknown option '$arg'. Use --help for usage information." >&2
            exit 1
            ;;
    esac
done

# Source common functions
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=/dev/null
source "$SCRIPT_DIR/common.sh"

# Get feature paths and validate branch
eval "$(get_feature_paths)"
check_feature_branch "$CURRENT_BRANCH" "$HAS_GIT" || exit 1

REPO_ROOT_NORMALISED="$REPO_ROOT"

# Perform global pre-flight checks once before optional early exit
PRECHECK_ERRORS=()

SPEC_KIT_ROOT="$REPO_ROOT_NORMALISED/.specify"
[[ -d "$SPEC_KIT_ROOT" ]] || PRECHECK_ERRORS+=("Spec Kit directory not found. Run /specify setup before continuing.")

WORKFLOW_RULE="$REPO_ROOT_NORMALISED/.cursor/rules/01-workflow.mdc"
[[ -f "$WORKFLOW_RULE" ]] || PRECHECK_ERRORS+=("Workflow rule file missing (.cursor/rules/01-workflow.mdc).")

MCP_CONFIG_PATH="$REPO_ROOT_NORMALISED/.cursor/mcp.json"
REQUIRED_SERVERS=(github supabase playwright docfork desktop-commander)

if [[ ! -f "$MCP_CONFIG_PATH" ]]; then
    PRECHECK_ERRORS+=("MCP configuration missing (.cursor/mcp.json).")
else
    if ! command -v node >/dev/null 2>&1; then
        PRECHECK_ERRORS+=("Node.js is required to validate MCP configuration but was not found in PATH.")
    else
        MCP_CHECK_OUTPUT="$(node "$SCRIPT_DIR/../../tools/node-mcp-validator.mjs" "$MCP_CONFIG_PATH" "${REQUIRED_SERVERS[@]}" 2>&1)"
        MCP_STATUS=$?
        if [[ $MCP_STATUS -ne 0 ]]; then
            while IFS= read -r line; do
                [[ -n "$line" ]] && PRECHECK_ERRORS+=("$line")
            done <<<"$MCP_CHECK_OUTPUT"
        fi
    fi
fi

if [[ ${#PRECHECK_ERRORS[@]} -gt 0 && $PATHS_ONLY == false ]]; then
    for message in "${PRECHECK_ERRORS[@]}"; do
        echo "ERROR: $message" >&2
    done
    exit 1
fi

# If paths-only mode, output paths and exit (support JSON + paths-only combined)
if $PATHS_ONLY; then
    if $JSON_MODE; then
        # Minimal JSON paths payload (no validation performed)
        printf '{"REPO_ROOT":"%s","BRANCH":"%s","FEATURE_DIR":"%s","FEATURE_SPEC":"%s","IMPL_PLAN":"%s","TASKS":"%s"}\n' \
            "$REPO_ROOT" "$CURRENT_BRANCH" "$FEATURE_DIR" "$FEATURE_SPEC" "$IMPL_PLAN" "$TASKS"
    else
        echo "REPO_ROOT: $REPO_ROOT"
        echo "BRANCH: $CURRENT_BRANCH"
        echo "FEATURE_DIR: $FEATURE_DIR"
        echo "FEATURE_SPEC: $FEATURE_SPEC"
        echo "IMPL_PLAN: $IMPL_PLAN"
        echo "TASKS: $TASKS"
    fi
    exit 0
fi

# Validate required directories and files
feature_exists=false
if [[ -d "$FEATURE_DIR" ]]; then
  feature_exists=true
fi

if [[ "$CURRENT_BRANCH" =~ ^[0-9]{3}- ]]; then
  if [[ "$feature_exists" == false ]]; then
    echo "ERROR: Feature directory not found: $FEATURE_DIR" >&2
    echo "Run /specify first to create the feature structure." >&2
    exit 1
  fi

  if [[ ! -f "$IMPL_PLAN" ]]; then
    echo "ERROR: plan.md not found in $FEATURE_DIR" >&2
    echo "Run /plan first to create the implementation plan." >&2
    exit 1
  fi
else
  if [[ "$feature_exists" == false ]]; then
    echo "INFO: No Spec Kit feature directory found yet." >&2
  fi
fi

# Check for tasks.md if required
if $REQUIRE_TASKS && [[ "$CURRENT_BRANCH" =~ ^[0-9]{3}- ]] && [[ ! -f "$TASKS" ]]; then
  echo "ERROR: tasks.md not found in $FEATURE_DIR" >&2
  echo "Run /tasks first to create the task list." >&2
  exit 1
fi
if $REQUIRE_TASKS && [[ ! -f "$TASKS" ]]; then
    echo "ERROR: tasks.md not found in $FEATURE_DIR" >&2
    echo "Run /tasks first to create the task list." >&2
    exit 1
fi

# Build list of available documents
docs=()

# Always check these optional docs
[[ -f "$RESEARCH" ]] && docs+=("research.md")
[[ -f "$DATA_MODEL" ]] && docs+=("data-model.md")

# Check contracts directory (only if it exists and has files)
if [[ -d "$CONTRACTS_DIR" ]] && [[ -n "$(ls -A "$CONTRACTS_DIR" 2>/dev/null)" ]]; then
    docs+=("contracts/")
fi

[[ -f "$QUICKSTART" ]] && docs+=("quickstart.md")

# Include tasks.md if requested and it exists
if $INCLUDE_TASKS && [[ -f "$TASKS" ]]; then
    docs+=("tasks.md")
fi

# Output results
if $JSON_MODE; then
    # Build JSON array of documents
    if [[ ${#docs[@]} -eq 0 ]]; then
        json_docs="[]"
    else
        json_docs=$(printf '"%s",' "${docs[@]}")
        json_docs="[${json_docs%,}]"
    fi
    
    printf '{"FEATURE_DIR":"%s","AVAILABLE_DOCS":%s}\n' "$FEATURE_DIR" "$json_docs"
else
    # Text output
    echo "FEATURE_DIR:$FEATURE_DIR"
    echo "AVAILABLE_DOCS:"
    
    # Show status of each potential document
    check_file "$RESEARCH" "research.md"
    check_file "$DATA_MODEL" "data-model.md"
    check_dir "$CONTRACTS_DIR" "contracts/"
    check_file "$QUICKSTART" "quickstart.md"
    
    if $INCLUDE_TASKS; then
        check_file "$TASKS" "tasks.md"
    fi
fi
