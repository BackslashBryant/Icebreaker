#!/usr/bin/env pwsh
# DEPRECATED: Do not use this script - it causes GitHub CLI auth issues
# GitHub CLI should use keyring authentication, not environment variables
# 
# If MCP servers need GITHUB_TOKEN, they should call 'gh auth token' directly
# or use the token from keyring, not from an environment variable

Write-Host "⚠️  WARNING: This script is deprecated!" -ForegroundColor Yellow
Write-Host ""
Write-Host "Setting GITHUB_TOKEN as an environment variable interferes with GitHub CLI authentication." -ForegroundColor Yellow
Write-Host ""
Write-Host "Instead:" -ForegroundColor Cyan
Write-Host "  1. Use 'gh auth login' to authenticate GitHub CLI (uses keyring)" -ForegroundColor White
Write-Host "  2. MCP servers should call 'gh auth token' to get the token when needed" -ForegroundColor White
Write-Host "  3. Do NOT set GITHUB_TOKEN as a persistent environment variable" -ForegroundColor White
Write-Host ""
Write-Host "To fix existing issues, run: tools/fix-github-auth.ps1" -ForegroundColor Cyan
Write-Host ""
exit 1

