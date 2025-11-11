# Create all 10 persona sim testing issues
$token = (Get-Content .env | Select-String "^GITHUB_TOKEN=" | ForEach-Object { $_.Line.Split('=', 2)[1].Trim('"''') })
$headers = @{
    "Authorization" = "Bearer $token"
    "Accept" = "application/vnd.github+json"
    "X-GitHub-Api-Version" = "2022-11-28"
}

$issues = @(
    @{
        title = "feat: Add PLAYWRIGHT_WS_MOCK transport + frontend shim"
        body = @"
## Why
Unlock deterministic multi-user runs without relying on live backend sockets.

## Scope
- Implement `tests/mocks/websocket-mock.ts` mirroring `createWebSocketConnection` behavior (`radar:subscribe`, `location:update`, chat lifecycle, panic).
- Add a runtime switch in `frontend/src/lib/websocket-client.ts` to use the mock when `PLAYWRIGHT_WS_MOCK=1`.
- Provide sample script + test proving two mock personas appear on Radar concurrently.

## Acceptance
- Playwright smoke run passes entirely with `PLAYWRIGHT_WS_MOCK=1`
- Docs updated in `docs/testing/persona-sim-testing-plan.md`

## Related
Part of Persona Sim Testing Phase 2 backlog.
"@
        labels = @("status:plan", "feature:testing", "agent:pixel")
    },
    @{
        title = "chore: Add persona presence fixture schema + baseline scripts"
        body = @"
## Why
Keep persona/tag/geo data consistent across suites.

## Scope
- Create `tests/fixtures/persona-presence/schema.d.ts` and reusable JSON fixtures (campus, coworking, event).
- Loader helper exposes fixture data to tests and WS mock.
- Document fixture usage in testing plan.

## Acceptance
- Persona specs import fixtures
- Running tests references shared personas instead of inline definitions

## Related
Part of Persona Sim Testing Phase 2 backlog.
"@
        labels = @("status:plan", "chore", "agent:pixel")
    },
    @{
        title = "feat: Implement geolocation helper + proximity boundary tests"
        body = @"
## Why
Simulate venue realism and verify proximity scoring.

## Scope
- Add `tests/utils/geolocation.ts` granting geolocation permission and setting coordinates/floor metadata.
- Define canonical locations in `tests/fixtures/locations.json`.
- Add tests covering just-inside/outside range and floor offsets.

## Acceptance
- Persona tests call helper
- Assertions confirm Radar reacts correctly to geo changes

## Related
Part of Persona Sim Testing Phase 2 backlog.
"@
        labels = @("status:plan", "feature:testing", "agent:pixel")
    },
    @{
        title = "feat: Upgrade persona E2E suites to dual-context flows"
        body = @"
## Why
Validate real interaction dynamics (visibility, compatibility, single chat rule).

## Scope
- For each persona group, add at least one test spawning two contexts (e.g., Maya+Zoe, Marcus+Ethan).
- Assert mutual visibility, signal score deltas, visibility toggle behavior, and chat gating.
- Leverage WS mock + fixtures for deterministic results.

## Acceptance
- Tests fail if personas don't see each other or chat rules misbehave

## Related
Part of Persona Sim Testing Phase 2 backlog.
"@
        labels = @("status:plan", "feature:testing", "agent:pixel")
    },
    @{
        title = "feat: Add Playwright visual snapshots for key screens"
        body = @"
## Why
Guard "terminal meets Game Boy" aesthetic during UI changes.

## Scope
- Capture screenshots for Welcome, Onboarding steps, Radar (empty/populated), Chat start/end, Panic prompt, Profile.
- Store in `artifacts/visual/<screen>/<viewport>.png`; mask dynamic elements (handles, timestamps).
- Set ≤2% diff threshold and document baselines.

## Acceptance
- Visual tests run on CI smoke/full suites
- Diffs surface layout regressions

## Related
Part of Persona Sim Testing Phase 2 backlog.
"@
        labels = @("status:plan", "feature:testing", "agent:pixel")
    },
    @{
        title = "feat: Validate look-and-feel across devices, themes, reduced motion"
        body = @"
## Why
Ensure experience holds for accessibility settings and breakpoints.

## Scope
- Add tests for small/medium mobile, tablet, desktop viewports.
- Run combos for light/dark themes, prefers-reduced-motion, high-contrast.
- Update `docs/testing/persona-scenarios.md` with matrix expectations.

## Acceptance
- CI artifacts include screenshots per combo
- Tests fail if CSS regressions occur

## Related
Part of Persona Sim Testing Phase 2 backlog.
"@
        labels = @("status:plan", "feature:testing", "agent:pixel", "accessibility")
    },
    @{
        title = "chore: Add data-testid to critical UI + selector map"
        body = @"
## Why
Reduce flake from copy and accessibility tweaks.

## Scope
- Add `data-testid` attributes to onboarding CTAs, vibe/tag chips, panic FAB, visibility toggle, chat controls, nav buttons.
- Create `tests/utils/selectors.ts` exporting canonical selectors.
- Refactor persona specs to use selector map; keep ARIA expectations for a11y tests.

## Acceptance
- All persona specs import selector map
- Axe scans confirm no accessibility regression

## Related
Part of Persona Sim Testing Phase 2 backlog.
"@
        labels = @("status:plan", "chore", "agent:pixel", "agent:link")
    },
    @{
        title = "feat: Emit persona run telemetry + summarize results"
        body = @"
## Why
Produce quantitative feedback (timings, errors) per run.

## Scope
- Implement `tests/utils/telemetry.ts` to record per-persona metrics and write JSON under `artifacts/persona-runs/`.
- Add `tools/summarize-persona-runs.mjs` to aggregate counts/top issues (tolerates empty dirs).
- Append summarized insights to `docs/testing/persona-feedback.md` after CI runs.

## Acceptance
- Telemetry files uploaded as CI artifacts
- Summary appears in logs/docs

## Related
Part of Persona Sim Testing Phase 2 backlog.
"@
        labels = @("status:plan", "feature:testing", "agent:pixel", "agent:nexus")
    },
    @{
        title = "chore: Split Playwright suites and extend browser matrix"
        body = @"
## Why
Keep fast feedback while ensuring rich nightly coverage.

## Scope
- Define smoke (Chromium mobile+desktop, subset tests) vs full (Chromium/WebKit/Firefox + visual + a11y) projects in Playwright config.
- Update GitHub Actions workflows to run smoke on push/PR and full nightly.
- Publish artifacts (screenshots, videos, telemetry) and implement flake quarantine/retry policy.

## Acceptance
- CI shows separate jobs with expected runtimes
- Documentation describes strategy

## Related
Part of Persona Sim Testing Phase 2 backlog.
"@
        labels = @("status:plan", "chore", "agent:nexus", "agent:pixel")
    },
    @{
        title = "feat: Add keyboard-only, screen-reader, and WS failure coverage"
        body = @"
## Why
Ensure safety UX under stress conditions.

## Scope
- Add keyboard-only journeys for onboarding, Radar navigation, panic usage.
- Assert SR labels/states for visibility toggle, panic, chat status via Playwright's accessibility tree.
- Simulate WS disconnect/failure and onboarding API 4xx/5xx with user-friendly recovery UI.
- Update edge-case docs with new findings.

## Acceptance
- Tests cover each scenario and fail if accessibility or failure UX regresses

## Related
Part of Persona Sim Testing Phase 2 backlog.
"@
        labels = @("status:plan", "feature:testing", "agent:pixel", "accessibility")
    }
)

$created = @()
foreach ($issue in $issues) {
    $body = @{
        title = $issue.title
        body = $issue.body
        labels = $issue.labels
    } | ConvertTo-Json -Depth 10
    
    try {
        $response = Invoke-RestMethod -Uri "https://api.github.com/repos/BackslashBryant/Icebreaker/issues" -Method Post -Headers $headers -Body $body -ContentType "application/json"
        $created += $response
        Write-Host "✅ Created issue #$($response.number): $($response.title)"
    } catch {
        Write-Host "❌ Failed to create '$($issue.title)': $($_.Exception.Message)"
        if ($_.ErrorDetails.Message) {
            Write-Host "   Details: $($_.ErrorDetails.Message)"
        }
    }
}

Write-Host "`n✨ Created $($created.Count)/$($issues.Count) issues"
if ($created.Count -gt 0) {
    Write-Host "`nCreated issues:"
    foreach ($issue in $created) {
        Write-Host "  #$($issue.number): $($issue.title) - $($issue.html_url)"
    }
}

