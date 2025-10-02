#!/bin/bash

# Spec Kit Setup Script
# Sets up Spec Kit integration for the project

set -e

# Configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SPEC_KIT_VERSION="${SPEC_KIT_VERSION:-latest}"

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

# Check if Spec Kit is installed
check_spec_kit() {
    if command -v specify &> /dev/null; then
        local version
        version=$(specify --version 2>/dev/null || echo "unknown")
        log_success "Spec Kit (specify) is installed: ${version}"
        return 0
    else
        log_warning "Spec Kit (specify) is not installed"
        return 1
    fi
}

# Install Spec Kit
install_spec_kit() {
    log_info "Installing Spec Kit from official GitHub repository..."
    
    # Check if uv is available
    if ! command -v uv &> /dev/null; then
        log_error "uv is not installed. Please install uv first: https://docs.astral.sh/uv/getting-started/installation/"
        return 1
    fi
    
    # Install Spec Kit from official GitHub repository
    if uv tool install specify-cli --from git+https://github.com/github/spec-kit.git; then
        log_success "Spec Kit (specify) installed successfully from GitHub"
        return 0
    else
        log_error "Failed to install Spec Kit from GitHub"
        return 1
    fi
}

# Initialize Spec Kit project
init_spec_kit() {
    log_info "Initializing Spec Kit project..."
    
    cd "$PROJECT_ROOT"
    
    # Initialize Spec Kit if not already initialized
    if [ ! -f "spec-kit.json" ]; then
        if specify init . --ai cursor --force; then
            log_success "Spec Kit project initialized"
        else
            log_warning "Failed to initialize Spec Kit project, continuing anyway"
        fi
    else
        log_info "Spec Kit project already initialized"
    fi
}

# Setup constitution
setup_constitution() {
    log_info "Setting up project constitution..."
    
    local constitution_file="$PROJECT_ROOT/memory/constitution.md"
    
    if [ ! -f "$constitution_file" ]; then
        log_warning "Constitution file not found: $constitution_file"
        log_info "Creating default constitution from template..."
        
        local template_file="$PROJECT_ROOT/templates/constitution-template.md"
        if [ -f "$template_file" ]; then
            cp "$template_file" "$constitution_file"
            log_success "Created constitution from template"
        else
            log_error "Constitution template not found: $template_file"
            return 1
        fi
    else
        log_info "Constitution file already exists"
    fi
}

# Setup templates
setup_templates() {
    log_info "Setting up Spec Kit templates..."
    
    local templates_dir="$PROJECT_ROOT/templates"
    
    if [ ! -d "$templates_dir" ]; then
        log_error "Templates directory not found: $templates_dir"
        return 1
    fi
    
    # Check if templates exist
    local required_templates=("spec-template.md" "plan-template.md" "constitution-template.md")
    local missing_templates=()
    
    for template in "${required_templates[@]}"; do
        if [ ! -f "$templates_dir/$template" ]; then
            missing_templates+=("$template")
        fi
    done
    
    if [ ${#missing_templates[@]} -ne 0 ]; then
        log_warning "Missing templates: ${missing_templates[*]}"
        log_info "Templates will be created as needed"
    else
        log_success "All required templates are present"
    fi
}

# Setup directory structure
setup_directories() {
    log_info "Setting up Spec Kit directory structure..."
    
    local directories=("memory" "specs" "templates")
    
    for dir in "${directories[@]}"; do
        local dir_path="$PROJECT_ROOT/$dir"
        if [ ! -d "$dir_path" ]; then
            mkdir -p "$dir_path"
            log_info "Created directory: $dir"
        else
            log_info "Directory already exists: $dir"
        fi
    done
    
    log_success "Directory structure is ready"
}

# Verify setup
verify_setup() {
    log_info "Verifying Spec Kit setup..."
    
    local errors=0
    
    # Check if Spec Kit is available
    if ! check_spec_kit; then
        log_warning "Spec Kit is not available, but setup will continue with fallback"
    fi
    
    # Check directory structure
    local required_dirs=("memory" "specs" "templates")
    for dir in "${required_dirs[@]}"; do
        if [ ! -d "$PROJECT_ROOT/$dir" ]; then
            log_error "Required directory missing: $dir"
            ((errors++))
        fi
    done
    
    # Check constitution
    if [ ! -f "$PROJECT_ROOT/memory/constitution.md" ]; then
        log_error "Constitution file missing"
        ((errors++))
    fi
    
    # Check templates
    local required_templates=("spec-template.md" "plan-template.md" "constitution-template.md")
    for template in "${required_templates[@]}"; do
        if [ ! -f "$PROJECT_ROOT/templates/$template" ]; then
            log_warning "Template missing: $template (will be created as needed)"
        fi
    done
    
    if [ $errors -eq 0 ]; then
        log_success "Spec Kit setup verification passed"
        return 0
    else
        log_error "Spec Kit setup verification failed with $errors errors"
        return 1
    fi
}

# Main setup function
main_setup() {
    log_info "Starting Spec Kit setup..."
    
    # Setup directory structure
    setup_directories
    
    # Setup constitution
    setup_constitution
    
    # Setup templates
    setup_templates
    
    # Check if Spec Kit is installed
    if ! check_spec_kit; then
        log_info "Spec Kit not found, attempting to install..."
        if install_spec_kit; then
            log_success "Spec Kit installed successfully"
        else
            log_warning "Failed to install Spec Kit, continuing with fallback mode"
        fi
    fi
    
    # Initialize Spec Kit project
    init_spec_kit
    
    # Verify setup
    if verify_setup; then
        log_success "Spec Kit setup completed successfully!"
        log_info "You can now use Spec Kit commands:"
        log_info "  npm run spec:clarify"
        log_info "  npm run spec:plan"
        log_info "  npm run spec:implement"
        log_info "  npm run spec:validate"
        log_info "  npm run spec:research"
    else
        log_error "Spec Kit setup completed with errors"
        return 1
    fi
}

# Main function
main() {
    local command="${1:-setup}"
    
    case "$command" in
        "setup")
            main_setup
            ;;
        "check")
            check_spec_kit
            ;;
        "install")
            install_spec_kit
            ;;
        "init")
            init_spec_kit
            ;;
        "verify")
            verify_setup
            ;;
        *)
            echo "Usage: $0 {setup|check|install|init|verify}"
            echo ""
            echo "Commands:"
            echo "  setup     Complete Spec Kit setup (default)"
            echo "  check     Check if Spec Kit is installed"
            echo "  install   Install Spec Kit"
            echo "  init      Initialize Spec Kit project"
            echo "  verify    Verify Spec Kit setup"
            echo ""
            echo "Environment variables:"
            echo "  SPEC_KIT_VERSION    Spec Kit version to install (default: latest)"
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"