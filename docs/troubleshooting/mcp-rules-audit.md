# MCP Rules & Documentation Audit - Complete

**Date**: 2025-01-27  
**Status**: All rules updated, old MCPs removed

## Summary

All team "brains" (rules and documentation) have been updated to reflect current MCP configuration. Old MCPs (Ref Tools, Railway) have been removed from all references.

## Files Updated

### ✅ Core Rules
1. **`.cursor/rules/04-integrations.mdc`**
   - ✅ Removed Ref Tools MCP
   - ✅ Removed Railway MCP  
   - ✅ Added Web Search (built-in) as replacement for Ref Tools
   - ✅ Updated description to list current MCPs
   - ✅ Added Desktop Commander and Time MCP documentation
   - ✅ Updated GitHub MCP to include documentation search use case

2. **`.cursor/rules/persona-scout.mdc`**
   - ✅ Updated workflow: GitHub MCP + web_search instead of Ref Tools
   - ✅ Removed "DocFork" reference (doesn't exist)

3. **`Docs/agents/prompts/scout.md`**
   - ✅ Updated rules: GitHub MCP + web_search instead of Ref Tools

### ✅ Agent Creation Docs
4. **`Docs/agents/CREATE_AGENTS.md`**
   - ✅ Updated all Scout references: GitHub MCP + web_search
   - ✅ Updated all Vector references: GitHub MCP + web_search
   - ✅ Updated all Forge references: GitHub MCP + web_search
   - ✅ Updated all Link references: GitHub MCP + Playwright MCP
   - ✅ Updated all Glide references: GitHub MCP + Playwright MCP
   - ✅ Updated all Apex references: GitHub MCP + web_search
   - ✅ Updated all Cider references: GitHub MCP + web_search
   - ✅ Updated all Muse references: GitHub MCP + web_search

### ✅ Tooling Scripts
5. **`tools/preflight.mjs`**
   - ✅ Removed `ref-tools-mcp` from required servers check

6. **`tools/health-check.mjs`**
   - ✅ Removed `ref-tools-mcp` from required servers check

## Current MCP Configuration (6 MCPs)

### Active MCPs
1. **GitHub MCP** - Branch/PR automation, repo search, code examples, documentation search
2. **Desktop Commander MCP** - File operations, process management, code search
3. **Playwright MCP** - UI screenshots, accessibility checks
4. **Supabase MCP** - Database operations, schema diffs
5. **Vercel MCP** - Deployment automation, project management
6. **Filesystem MCP** - File operations within workspace
7. **Time MCP** - Date/timestamp operations (mandatory for dated entries)

### Built-in Tools
- **Web Search** - Documentation search (replaces Ref Tools MCP)

### Removed MCPs
- **Ref Tools MCP** - Replaced by GitHub MCP + web_search
- **Railway MCP** - Replaced by Railway CLI (works perfectly)

## Usage Guidance

### Research (Scout)
- **Primary**: GitHub MCP (code/repo search)
- **Secondary**: web_search (documentation)
- **Fallback**: Trusted web sources

### Documentation Search
- **GitHub MCP**: Search code/repos for examples and patterns
- **web_search**: Find official docs, Stack Overflow, etc.
- **Combined**: Provides comprehensive coverage

### Railway Operations
- **Use**: Railway CLI directly (`railway` commands)
- **Not needed**: Railway MCP (removed due to package issues)

## Verification

All references to old MCPs have been removed:
- ✅ No Ref Tools MCP references in rules
- ✅ No Railway MCP references in rules
- ✅ All agent prompts updated
- ✅ All tooling scripts updated
- ✅ Preflight checks updated

**Status**: Team "brains" are now aligned with current MCP configuration! 🎯

