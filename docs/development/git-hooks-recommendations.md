# Git Hooks Recommendations for Icebreaker

## Current Setup Analysis

### Existing Hooks
- **pre-commit**: Comprehensive hook with:
  - Cursor file mode validation (app vs template)
  - Branch naming validation
  - Preflight checks (`npm run status`)
  - Date validation (placeholder dates)
  - Linting (staged files only)
  - Secret detection
  - Merge conflict detection
  - .env file protection
  - Lock file consistency checks
  - Binary file detection
  - Agent path-scope guards (advisory mode - team-friendly)
- **commit-msg**: Commit message validation
- **post-merge**: Auto-update dependencies after merges
- **pre-push**: Lightweight pre-push checks
- **post-checkout**: Auto-setup after branch switches

### Codebase Characteristics
- **Language**: Node.js/JavaScript/TypeScript
- **Testing**: Unit, E2E (Playwright), Security tests
- **Linting**: Guard runner (`npm run guard:lint`)
- **Type Checking**: Guard runner (`npm run guard:type`)
- **Workflow**: Agent-based with strict path scoping
- **CI/CD**: GitHub Actions with comprehensive checks

---

## Recommended Hooks

### ✅ **HIGH PRIORITY** - Implement Now

#### 1. **commit-msg** - Commit Message Validation
**Why**: Your workflow requires specific commit message format (`feat: Complete Issue #X - [description]`)

**Benefits**:
- Enforces conventional commits with issue numbers
- Prevents malformed commit messages
- Ensures traceability to GitHub issues

**Implementation**:
```bash
# scripts/hooks/commit-msg.sample
#!/usr/bin/env bash
# Validate commit message format

commit_msg=$(cat "$1")

# Pattern: feat|fix|chore|docs|refactor|test|style: <description> OR Issue #<number>
# Allow: feat: Complete Issue #123 - description
# Allow: fix: Issue #456 - bug description
# Allow: chore: workflow improvements
# Block: "fixed bug" (no type prefix)
# Block: "feat: something" (no issue reference when required)

if ! echo "$commit_msg" | grep -qE '^(feat|fix|chore|docs|refactor|test|style|perf|build|ci|revert)(\(.+\))?: .+'; then
  echo "ERROR: Commit message must follow conventional commit format:"
  echo "  <type>: <description>"
  echo "  Types: feat, fix, chore, docs, refactor, test, style, perf, build, ci, revert"
  echo ""
  echo "Your message: $commit_msg"
  exit 1
fi

# Check for Issue # reference in feature/fix commits
if echo "$commit_msg" | grep -qE '^(feat|fix):' && ! echo "$commit_msg" | grep -qiE '(issue|#)\s*\d+'; then
  echo "WARNING: Feature/fix commits should reference issue number:"
  echo "  Example: feat: Complete Issue #123 - description"
  echo "  Your message: $commit_msg"
  echo ""
  read -p "Continue anyway? (y/N) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi

exit 0
```

#### 2. **pre-commit** - Enhance Existing Hook
**Current**: Good foundation, but can add:

**Additions**:
- **Linting** (fast, staged files only)
- **Formatting** (Prettier for consistency)
- **Secret detection** (prevent API keys/tokens)
- **File size checks** (prevent large files)

**Recommended additions**:
```bash
# Add to existing pre-commit.sample after date validation

# Run linting on staged files (fast)
echo "[pre-commit] Running linter on staged files..."
if ! npm run guard:lint -- --staged 2>/dev/null; then
  echo "Linting errors found. Run 'npm run guard:lint' to see details."
  echo "Tip: Run 'npm run guard:lint -- --fix' to auto-fix some issues."
  exit 1
fi

# Check for secrets (API keys, tokens, passwords)
echo "[pre-commit] Checking for secrets..."
if command -v detect-secrets >/dev/null 2>&1; then
  if ! detect-secrets scan --baseline .secrets.baseline --staged-only; then
    echo "Potential secrets detected. Review and remove before committing."
    exit 1
  fi
fi

# Check file sizes (prevent large files)
echo "[pre-commit] Checking file sizes..."
MAX_SIZE=524288  # 512KB
large_files=$(git diff --cached --name-only | while read file; do
  if [ -f "$file" ]; then
    size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null || echo 0)
    if [ "$size" -gt "$MAX_SIZE" ]; then
      echo "$file ($size bytes)"
    fi
  fi
done)

if [ -n "$large_files" ]; then
  echo "WARNING: Large files detected (>512KB):"
  echo "$large_files"
  echo "Consider using Git LFS or removing unnecessary files."
  read -p "Continue anyway? (y/N) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi
```

---

### ⚠️ **MEDIUM PRIORITY** - Consider Adding

#### 3. **pre-push** - Comprehensive Checks Before Push
**Why**: Catch issues before they reach remote, but balance with speed

**Benefits**:
- Run full test suite before push
- Prevent pushing to protected branches
- Validate branch naming matches remote

**Considerations**:
- Can be slow (full test suite)
- May frustrate developers if too strict
- Better suited for CI/CD

**Recommendation**: **Skip for now** - Your CI already handles this comprehensively. Pre-push hooks can slow down workflow.

#### 4. **post-commit** - Automated Follow-ups
**Why**: Could automate issue updates, changelog generation

**Potential uses**:
- Auto-update GitHub issue status
- Generate changelog entries
- Update feature tracking files

**Recommendation**: **Skip for now** - Your workflow already handles completion steps manually. Automation here could conflict with agent workflow.

---

### 🔧 **OPTIONAL** - Nice to Have

#### 5. **prepare-commit-msg** - Auto-prepare Commit Messages
**Why**: Could auto-add issue numbers from branch names

**Example**:
```bash
#!/usr/bin/env bash
# Auto-add issue number from branch name to commit message

branch=$(git rev-parse --abbrev-ref HEAD)
if [[ $branch =~ agent/[^/]+/([0-9]+)- ]]; then
  issue_num="${BASH_REMATCH[1]}"
  commit_msg=$(cat "$1")
  
  # If message doesn't already reference issue, prepend it
  if ! echo "$commit_msg" | grep -qiE "(issue|#)\s*$issue_num"; then
    echo "Issue #$issue_num - $commit_msg" > "$1"
  fi
fi
```

**Recommendation**: **Skip** - Your commit-msg hook already enforces format, and manual control is better for your workflow.

---

## Implementation Priority

### Phase 1: Immediate (High Value, Low Risk)
1. ✅ **commit-msg** hook - Enforce commit message format
2. ✅ **pre-commit** enhancements:
   - Linting on staged files
   - Secret detection
   - File size checks

### Phase 2: Evaluate (Medium Value)
3. ⚠️ Monitor if pre-push would help (probably not needed with your CI)
4. ⚠️ Consider post-commit automation (may conflict with agent workflow)

### Phase 3: Skip (Low Value for Your Workflow)
5. ❌ prepare-commit-msg (manual control preferred)
6. ❌ post-merge/post-checkout (not needed)

---

## Hook Management Strategy

### Option 1: Manual Git Hooks (Current Approach)
**Pros**:
- Simple, no dependencies
- Full control
- Works with your existing setup

**Cons**:
- Manual installation required
- No version control for hook configs (you use .sample files)

**Recommendation**: **Keep current approach** - Your `.sample` files work well.

### Option 2: Husky + lint-staged
**Pros**:
- Easy setup
- Version controlled hooks
- Popular in Node.js ecosystem

**Cons**:
- Additional dependency
- May conflict with your custom hooks
- Less control

**Recommendation**: **Skip** - Your current manual approach is cleaner for your workflow.

### Option 3: Lefthook
**Pros**:
- Fast, parallel execution
- Multi-language support
- Good performance

**Cons**:
- Additional dependency
- Learning curve
- Overkill for your needs

**Recommendation**: **Skip** - Your hooks are simple enough that parallel execution isn't needed.

---

## Specific Recommendations for Your Codebase

### 1. Commit Message Format Enforcement
**Critical** - Your workflow depends on issue traceability. Enforce:
- Conventional commit types
- Issue number references for features/fixes
- Clear descriptions

### 2. Secret Detection
**High Priority** - You handle GitHub tokens, Supabase keys, etc.
- Use `detect-secrets` or `git-secrets`
- Scan for common patterns (API keys, tokens, passwords)
- Block commits with potential secrets

### 3. Staged-File-Only Checks
**Performance Critical** - Your codebase is large
- Only lint/check staged files
- Use `--staged` flags where available
- Keep pre-commit fast (<5 seconds)

### 4. File Size Limits
**Prevent Issues** - Large files cause problems
- Block files >512KB (except known exceptions)
- Suggest Git LFS for large assets
- Warn about binary files

### 5. YAML/JSON Validation
**Prevent CI Failures** - Config files break CI
- Validate `.github/workflows/*.yml`
- Validate `package.json`, `.cursor/mcp.json`
- Catch syntax errors early

---

## Implementation Checklist

- [ ] Create `scripts/hooks/commit-msg.sample`
- [ ] Add linting to `pre-commit.sample` (staged files only)
- [ ] Add secret detection to `pre-commit.sample`
- [ ] Add file size checks to `pre-commit.sample`
- [ ] Add YAML/JSON validation to `pre-commit.sample`
- [ ] Update `tools/install-agent-hook.mjs` to install commit-msg hook
- [ ] Document hook installation in `docs/development/DEVELOPMENT.md`
- [ ] Test hooks with sample commits
- [ ] Add `--no-verify` bypass documentation for emergencies

---

## Performance Considerations

### Pre-commit Hook Speed Targets
- **Target**: <5 seconds total
- **Current**: ~2-3 seconds (preflight + date check)
- **With additions**: ~4-5 seconds (acceptable)

### Optimization Strategies
1. **Staged files only**: All checks should use `--staged` flag
2. **Parallel execution**: Not needed (hooks are fast)
3. **Caching**: Consider caching lint results (future optimization)
4. **Skip checks**: Allow `--no-verify` for emergency commits (documented)

---

## Security Considerations

### Secret Detection
- **Tool**: `detect-secrets` (Python) or `git-secrets` (simpler)
- **Baseline**: Create `.secrets.baseline` for known false positives
- **Patterns**: API keys, tokens, passwords, private keys

### File Permissions
- Ensure hooks are executable: `chmod +x .git/hooks/*`
- Document installation process
- Provide bypass mechanism for emergencies

---

## Conclusion

**Recommended Implementation**:
1. ✅ **commit-msg** hook - Critical for workflow
2. ✅ **pre-commit** enhancements - Linting, secrets, file size
3. ❌ **Skip pre-push** - CI handles this better
4. ❌ **Skip post-commit** - Conflicts with agent workflow

**Total New Hooks**: 1 (commit-msg)
**Enhanced Hooks**: 1 (pre-commit)

This balances automation with workflow flexibility and maintains your agent-based development model.

