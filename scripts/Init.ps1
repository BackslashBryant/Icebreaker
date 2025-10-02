# Cursor Template Project Initialization Script
# Sets up the project with Spec Kit integration and all required components

Write-Host "Initializing Cursor Template Project with Spec Kit Integration..." -ForegroundColor Blue

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "Error: package.json not found. Please run this script from the project root." -ForegroundColor Red
    exit 1
}

Write-Host "Project root detected" -ForegroundColor Green

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "Node.js detected: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "Error: Node.js not found. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Check if npm is installed
try {
    $npmVersion = npm --version
    Write-Host "npm detected: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "Error: npm not found. Please install npm first." -ForegroundColor Red
    exit 1
}

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
try {
    npm install
    Write-Host "Dependencies installed successfully" -ForegroundColor Green
} catch {
    Write-Host "Error: Failed to install dependencies" -ForegroundColor Red
    exit 1
}

# Setup Spec Kit
Write-Host "Setting up Spec Kit integration..." -ForegroundColor Yellow
try {
    if (Test-Path "scripts/spec-kit-setup.sh") {
        # Run Spec Kit setup script
        bash scripts/spec-kit-setup.sh setup
        Write-Host "Spec Kit setup completed" -ForegroundColor Green
    } else {
        Write-Host "Spec Kit setup script not found, continuing without Spec Kit" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Spec Kit setup failed, continuing without Spec Kit" -ForegroundColor Yellow
}

# Verify setup
Write-Host "Verifying setup..." -ForegroundColor Yellow
try {
    if (Test-Path "scripts/verify-spec-kit.sh") {
        bash scripts/verify-spec-kit.sh verify
        Write-Host "Setup verification completed" -ForegroundColor Green
    } else {
        Write-Host "Verification script not found, skipping verification" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Setup verification failed, but continuing" -ForegroundColor Yellow
}

# Display next steps
Write-Host ""
Write-Host "Project initialization completed!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Blue
Write-Host "  1. Update the project name and description in package.json" -ForegroundColor White
Write-Host "  2. Configure your repository settings in .cursor/mcp.json" -ForegroundColor White
Write-Host "  3. Review and customize the constitution in memory/constitution.md" -ForegroundColor White
Write-Host "  4. Start building your project!" -ForegroundColor White
Write-Host ""
Write-Host "Available commands:" -ForegroundColor Blue
Write-Host "  npm run dev          - Start development server" -ForegroundColor White
Write-Host "  npm run build        - Build the project" -ForegroundColor White
Write-Host "  npm run test         - Run tests" -ForegroundColor White
Write-Host "  npm run spec:clarify - Clarify requirements (Spec Kit)" -ForegroundColor White
Write-Host "  npm run spec:plan    - Create implementation plan (Spec Kit)" -ForegroundColor White
Write-Host "  npm run git:automation - Complete git workflow automation" -ForegroundColor White
Write-Host ""
Write-Host "Documentation:" -ForegroundColor Blue
Write-Host "  docs/SPEC_KIT_GUIDE.md - Spec Kit integration guide" -ForegroundColor White
Write-Host "  docs/PRD.md           - Product requirements document" -ForegroundColor White
Write-Host "  README.md             - Project overview and getting started" -ForegroundColor White
Write-Host ""
Write-Host "Happy coding!" -ForegroundColor Green