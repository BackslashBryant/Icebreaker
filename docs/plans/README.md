# Plan-Status Files Reference

**Purpose**: Document plan-status file naming conventions, lifecycle rules, and structure.

## Naming Convention

**Strict Format**: `Issue-<id>-plan-status-<STATE>.md`

Where:
- `<id>` is the GitHub issue number (e.g., `10`, `21`, `33`)
- `<STATE>` is one of:
  - `IN-PROGRESS` - Work is actively being done
  - `COMPLETE` - Work is finished and verified
  - `SUPERSEDED` - Plan was replaced by a newer version
  - `BLOCKED` - Work cannot proceed due to dependencies or blockers

**Examples**:
- `Issue-10-plan-status-IN-PROGRESS.md`
- `Issue-21-plan-status-COMPLETE.md`
- `Issue-26-plan-status-SUPERSEDED.md`

## Lifecycle Rules

### When Starting an Issue

1. **Create plan-status file**: `Docs/plans/Issue-<id>-plan-status-IN-PROGRESS.md`
   - Use template structure (see below)
   - Include: Goal, Constraints, Checkpoints, Research Summary
   - Reference research file: `Docs/research/Issue-<id>-research.md`

2. **Create research file** (if needed): `Docs/research/Issue-<id>-research.md`
   - Required for: Investigation, UX changes, infrastructure changes
   - Optional for: Simple bug fixes, straightforward features

### When Completing an Issue

1. **Mark all steps as complete** with completion dates
2. **Update status field** to `complete`
3. **Rename file**: Change from `Issue-<id>-plan-status-IN-PROGRESS.md` to `Issue-<id>-plan-status-COMPLETE.md`
4. **Add "Outcome" section** with:
   - Status summary
   - Completion date
   - Branch name
   - Commit hash
   - Key PRs/commits (if applicable)
   - Follow-up issues (if any)
   - Verification results

### When Superseding a Plan

1. **Rename old file**: `Issue-<id>-plan-status-SUPERSEDED.md`
2. **Create new file**: `Issue-<id>-plan-status-IN-PROGRESS.md` (or `-v2`, `-v3` if multiple versions)
3. **Link from new to old**: Reference superseded plan in new file

### When Blocking Work

1. **Rename file**: `Issue-<id>-plan-status-BLOCKED.md`
2. **Document blockers** in "Current Issues" section
3. **Update when unblocked**: Rename back to `IN-PROGRESS` when work resumes

## Plan-Status File Structure

Each issue has ONE living document: `Docs/plans/Issue-<#>-plan-status-<STATE>.md`

### Required Sections

1. **Research Summary** (full inline, not just a reference)
   - Research Question
   - Constraints
   - Sources & Findings
   - Recommendations Summary
   - Rollback Options

2. **Goals & Success Metrics**
   - What we're building
   - How we'll measure success

3. **Plan Steps** (numbered checkpoints with status)
   - Each step has: Description, Owner, Acceptance Tests, Status (✅ COMPLETE / ⏳ IN-PROGRESS / ⏸️ BLOCKED)

4. **Current Status**
   - Overall status: IN-PROGRESS / COMPLETE / BLOCKED
   - Step completion tracking

5. **Current Issues** (blockers/loops)
   - Document any blockers or recurring problems here

6. **Team Review** (before implementation)
   - All agent approvals
   - Must show "✅ APPROVED" before implementation begins

7. **Outcome** (when complete)
   - Status summary
   - Completion date
   - Branch name
   - Commit hash
   - Key PRs/commits
   - Follow-up issues
   - Verification results

## Research File Pattern

**Format**: `Docs/research/Issue-<id>-research.md`

**When to create**:
- Investigation required (unknown patterns, new tech)
- UX changes (new flows, design decisions)
- Infrastructure changes (new services, migrations)

**When to skip**:
- Simple bug fixes
- Straightforward features with clear patterns

**Structure**:
- Research Question
- Constraints
- Sources & Findings (with URLs)
- Recommendations
- Rollback Options

## Legacy Files

The following legacy plan files should be migrated to standard naming:

- `Issue-18-persona-testing.md` → `Issue-18-plan-status-SUPERSEDED.md`
- `Issue-21-plan-status.md` → Archive or consolidate with `Issue-21-plan-status-COMPLETE.md`
- `Issue-25-chat-request-cooldowns.md` → `Issue-25-plan-status-SUPERSEDED.md`

See `Docs/migration/plan-status-migration.md` for migration steps.

## Guardrails

**MANDATORY**: No issue is `status:done` unless:
1. Matching `plan-status-COMPLETE.md` file exists
2. File is renamed to `-COMPLETE` (not just status field updated)
3. "Outcome" section is complete with all required information

**Workflow enforcement**: See `.cursor/rules/01-workflow.mdc` for automated checks.

## Maintenance

- **Vector** creates and maintains plan-status files
- **All agents** update plan-status files as work progresses
- **Vector** ensures naming conventions are followed

For questions or updates to this reference, contact @Vector 🎯
