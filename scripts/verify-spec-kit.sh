#!/bin/bash

# Spec Kit Verification Script
# Verifies Spec Kit integration and functionality

set -e

# Configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

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

# Check Spec Kit installation
check_spec_kit_installation() {
    log_info "Checking Spec Kit installation..."
    
    if command -v specify &> /dev/null; then
        local version
        version=$(specify --version 2>/dev/null || echo "unknown")
        log_success "Spec Kit (specify) is installed: ${version}"
        return 0
    else
        log_error "Spec Kit (specify) is not installed. Please install it using: uv tool install specify-cli --from git+https://github.com/github/spec-kit.git"
        return 1
    fi
}

# Check directory structure
check_directory_structure() {
    log_info "Checking Spec Kit directory structure..."
    
    local required_dirs=("memory" "specs" "templates")
    local errors=0
    
    for dir in "${required_dirs[@]}"; do
        local dir_path="$PROJECT_ROOT/$dir"
        if [ -d "$dir_path" ]; then
            log_success "Directory exists: $dir"
        else
            log_error "Directory missing: $dir"
            ((errors++))
        fi
    done
    
    if [ $errors -eq 0 ]; then
        log_success "Directory structure is correct"
        return 0
    else
        log_error "Directory structure has $errors errors"
        return 1
    fi
}

# Check constitution
check_constitution() {
    log_info "Checking project constitution..."
    
    local constitution_file="$PROJECT_ROOT/memory/constitution.md"
    
    if [ -f "$constitution_file" ]; then
        local file_size
        file_size=$(wc -c < "$constitution_file")
        if [ "$file_size" -gt 100 ]; then
            log_success "Constitution file exists and has content ($file_size bytes)"
            return 0
        else
            log_warning "Constitution file exists but is very small ($file_size bytes)"
            return 1
        fi
    else
        log_error "Constitution file missing: $constitution_file"
        return 1
    fi
}

# Check templates
check_templates() {
    log_info "Checking Spec Kit templates..."
    
    local templates_dir="$PROJECT_ROOT/templates"
    local required_templates=("spec-template.md" "plan-template.md" "constitution-template.md")
    local errors=0
    
    for template in "${required_templates[@]}"; do
        local template_file="$templates_dir/$template"
        if [ -f "$template_file" ]; then
            local file_size
            file_size=$(wc -c < "$template_file")
            if [ "$file_size" -gt 50 ]; then
                log_success "Template exists: $template ($file_size bytes)"
            else
                log_warning "Template exists but is very small: $template ($file_size bytes)"
                ((errors++))
            fi
        else
            log_error "Template missing: $template"
            ((errors++))
        fi
    done
    
    if [ $errors -eq 0 ]; then
        log_success "All templates are present and have content"
        return 0
    else
        log_error "Template check failed with $errors errors"
        return 1
    fi
}

# Check package.json scripts
check_package_scripts() {
    log_info "Checking package.json Spec Kit scripts..."
    
    local package_file="$PROJECT_ROOT/package.json"
    
    if [ ! -f "$package_file" ]; then
        log_error "package.json not found"
        return 1
    fi
    
    local required_scripts=("spec:clarify" "spec:plan" "spec:implement" "spec:validate" "spec:research")
    local errors=0
    
    for script in "${required_scripts[@]}"; do
        if grep -q "\"$script\":" "$package_file"; then
            log_success "Script found: $script"
        else
            log_error "Script missing: $script"
            ((errors++))
        fi
    done
    
    if [ $errors -eq 0 ]; then
        log_success "All Spec Kit scripts are present in package.json"
        return 0
    else
        log_error "Package.json script check failed with $errors errors"
        return 1
    fi
}

# Check Cursor rules
check_cursor_rules() {
    log_info "Checking Cursor rules integration..."
    
    local rules_dir="$PROJECT_ROOT/.cursor/rules"
    local spec_kit_rule="$rules_dir/06-spec-kit.mdc"
    
    if [ -d "$rules_dir" ]; then
        log_success "Cursor rules directory exists"
    else
        log_error "Cursor rules directory missing: $rules_dir"
        return 1
    fi
    
    if [ -f "$spec_kit_rule" ]; then
        local file_size
        file_size=$(wc -c < "$spec_kit_rule")
        if [ "$file_size" -gt 100 ]; then
            log_success "Spec Kit rule file exists and has content ($file_size bytes)"
        else
            log_warning "Spec Kit rule file exists but is very small ($file_size bytes)"
            return 1
        fi
    else
        log_error "Spec Kit rule file missing: $spec_kit_rule"
        return 1
    fi
    
    # Check for OpenSpec references (should be removed)
    local openspec_refs
    openspec_refs=$(grep -r "OpenSpec" "$rules_dir" 2>/dev/null | wc -l)
    if [ "$openspec_refs" -eq 0 ]; then
        log_success "No OpenSpec references found in rules (correctly removed)"
    else
        log_warning "Found $openspec_refs OpenSpec references in rules (should be removed)"
    fi
    
    return 0
}

# Check git automation scripts
check_git_scripts() {
    log_info "Checking git automation scripts..."
    
    local scripts_dir="$PROJECT_ROOT/scripts"
    local required_scripts=("git-automation.sh" "create-issue.sh" "create-branch.sh" "create-pr.sh")
    local errors=0
    
    for script in "${required_scripts[@]}"; do
        local script_file="$scripts_dir/$script"
        if [ -f "$script_file" ]; then
            if [ -x "$script_file" ]; then
                log_success "Script exists and is executable: $script"
            else
                log_warning "Script exists but is not executable: $script"
            fi
        else
            log_error "Script missing: $script"
            ((errors++))
        fi
    done
    
    if [ $errors -eq 0 ]; then
        log_success "All git automation scripts are present"
        return 0
    else
        log_error "Git automation script check failed with $errors errors"
        return 1
    fi
}

# Test Spec Kit commands
test_spec_kit_commands() {
    log_info "Testing Spec Kit commands..."
    
    if ! command -v spec-kit &> /dev/null; then
        log_warning "Spec Kit not installed, skipping command tests"
        return 0
    fi
    
    local commands=("clarify" "plan" "implement" "validate" "research")
    local errors=0
    
    for cmd in "${commands[@]}"; do
        if spec-kit "$cmd" --help &> /dev/null; then
            log_success "Command works: spec-kit $cmd"
        else
            log_warning "Command failed: spec-kit $cmd"
            ((errors++))
        fi
    done
    
    if [ $errors -eq 0 ]; then
        log_success "All Spec Kit commands are working"
        return 0
    else
        log_warning "Some Spec Kit commands failed ($errors errors)"
        return 1
    fi
}

# Test npm scripts
test_npm_scripts() {
    log_info "Testing npm Spec Kit scripts..."
    
    local scripts=("spec:clarify" "spec:plan" "spec:implement" "spec:validate" "spec:research")
    local errors=0
    
    for script in "${scripts[@]}"; do
        if npm run "$script" &> /dev/null; then
            log_success "Script works: npm run $script"
        else
            log_warning "Script failed: npm run $script"
            ((errors++))
        fi
    done
    
    if [ $errors -eq 0 ]; then
        log_success "All npm Spec Kit scripts are working"
        return 0
    else
        log_warning "Some npm Spec Kit scripts failed ($errors errors)"
        return 1
    fi
}

# Generate verification report
generate_report() {
    local total_checks=8
    local passed_checks=0
    local failed_checks=0
    local warning_checks=0
    
    log_info "Generating verification report..."
    
    # Run all checks and count results
    check_spec_kit_installation && ((passed_checks++)) || ((failed_checks++))
    check_directory_structure && ((passed_checks++)) || ((failed_checks++))
    check_constitution && ((passed_checks++)) || ((failed_checks++))
    check_templates && ((passed_checks++)) || ((failed_checks++))
    check_package_scripts && ((passed_checks++)) || ((failed_checks++))
    check_cursor_rules && ((passed_checks++)) || ((failed_checks++))
    check_git_scripts && ((passed_checks++)) || ((failed_checks++))
    test_spec_kit_commands && ((passed_checks++)) || ((warning_checks++))
    
    echo ""
    log_info "=== VERIFICATION REPORT ==="
    log_info "Total checks: $total_checks"
    log_success "Passed: $passed_checks"
    if [ $warning_checks -gt 0 ]; then
        log_warning "Warnings: $warning_checks"
    fi
    if [ $failed_checks -gt 0 ]; then
        log_error "Failed: $failed_checks"
    fi
    
    if [ $failed_checks -eq 0 ]; then
        log_success "Spec Kit integration verification PASSED!"
        return 0
    else
        log_error "Spec Kit integration verification FAILED!"
        return 1
    fi
}

# Main function
main() {
    local command="${1:-verify}"
    
    case "$command" in
        "verify")
            generate_report
            ;;
        "check-installation")
            check_spec_kit_installation
            ;;
        "check-structure")
            check_directory_structure
            ;;
        "check-constitution")
            check_constitution
            ;;
        "check-templates")
            check_templates
            ;;
        "check-scripts")
            check_package_scripts
            ;;
        "check-rules")
            check_cursor_rules
            ;;
        "check-git")
            check_git_scripts
            ;;
        "test-commands")
            test_spec_kit_commands
            ;;
        "test-npm")
            test_npm_scripts
            ;;
        *)
            echo "Usage: $0 {verify|check-installation|check-structure|check-constitution|check-templates|check-scripts|check-rules|check-git|test-commands|test-npm}"
            echo ""
            echo "Commands:"
            echo "  verify              Complete verification (default)"
            echo "  check-installation  Check Spec Kit installation"
            echo "  check-structure     Check directory structure"
            echo "  check-constitution  Check constitution file"
            echo "  check-templates     Check template files"
            echo "  check-scripts       Check package.json scripts"
            echo "  check-rules         Check Cursor rules integration"
            echo "  check-git           Check git automation scripts"
            echo "  test-commands       Test Spec Kit commands"
            echo "  test-npm            Test npm scripts"
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"