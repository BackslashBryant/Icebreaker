# Create proactive production readiness issues
$token = (Get-Content .env | Select-String "^GITHUB_TOKEN=" | ForEach-Object { $_.Line.Split('=', 2)[1].Trim('"''') })
$headers = @{
    "Authorization" = "Bearer $token"
    "Accept" = "application/vnd.github+json"
    "X-GitHub-Api-Version" = "2022-11-28"
}

$issues = @(
    @{
        title = "Performance Verification & Benchmarking"
        body = @"
## Why
Vision success criteria require performance budgets: Chat starts in < 500ms, Radar updates in < 1s. No verification exists to ensure these targets are met.

## Problem
- No performance test suite measuring chat start latency
- No performance test suite measuring radar update latency  
- No CI enforcement of performance budgets
- Performance baselines not documented
- Risk of shipping with performance regressions

## Scope
- Create performance test suite measuring chat start latency (target: < 500ms)
- Create performance test suite measuring radar update latency (target: < 1s)
- Add performance budgets to CI (fail if thresholds exceeded)
- Document performance baselines in `docs/testing/performance-baselines.md`
- Add performance regression detection to CI workflow
- Create performance monitoring in production (Issue #12 will handle observability)

## Acceptance
- Performance tests pass with < 500ms chat start, < 1s radar updates
- CI enforces performance budgets (fails if thresholds exceeded)
- Performance baselines documented
- Performance regression detection in CI
- Tests run on every PR and main branch

## Success Metrics
- Chat start latency: < 500ms (p95)
- Radar update latency: < 1s (p95)
- Performance tests pass consistently
- CI fails on performance regressions

## Related
- Vision requirement: `docs/vision.md` Section 4 (Performance: Chat starts in < 500ms; Radar updates in < 1s)
- Issue #9: Persona-Simulated User Testing (may include performance telemetry)
- Issue #12: Monitoring & Observability (will consume performance metrics)

## Out of Scope
- Load/stress testing (deferred to post-launch per Issue #4)
- Performance optimization (separate issue if benchmarks fail)
"@
        labels = @("status:plan", "feature:testing", "agent:pixel", "agent:nexus", "performance")
    },
    @{
        title = "Production Deployment Infrastructure"
        body = @"
## Why
Launch blocker. No production environment, deployment process, or rollback plan exists. Cannot launch MVP without production infrastructure.

## Problem
- No production environment configured
- No deployment workflow defined
- No rollback procedures documented
- Platform choice not finalized
- SSL/domain configuration not set up
- Environment variables/secrets not configured for production

## Scope
- Choose deployment platform (Vercel/Netlify/Railway/Render/etc.) based on:
  - Node.js + WebSocket support
  - Cost (free tier acceptable for MVP)
  - Ease of setup
  - Environment variable management
- Set up production environment
- Create deployment workflow (GitHub Actions or platform-native)
- Document rollback procedures
- Set up SSL/domain configuration
- Configure production environment variables/secrets
- Test deployment process end-to-end
- Document deployment runbook in `docs/deployment/RUNBOOK.md`

## Acceptance
- Production environment ready and accessible
- Deployment workflow tested (deploy, verify, rollback)
- Rollback plan documented and tested
- SSL/domain configured
- Environment variables secured
- Deployment runbook complete
- Team can deploy with confidence

## Success Metrics
- Successful production deployment
- Rollback tested and working
- Production environment stable
- Deployment time < 5 minutes
- Zero-downtime deployments (if possible)

## Related
- Issue #4: Integration Testing & Launch Preparation (completed, but deployment not included)
- Issue #12: Monitoring & Observability (needed for production health checks)
- Issue #24: Production Readiness Documentation (will document full checklist)

## Out of Scope
- Multi-region deployment (post-MVP)
- Blue-green deployments (post-MVP)
- Auto-scaling configuration (post-MVP)
"@
        labels = @("status:plan", "infrastructure", "agent:nexus", "agent:muse", "launch-blocker")
    },
    @{
        title = "Monitoring, Observability & Error Tracking"
        body = @"
## Why
Operational requirement for production. Sentry mentioned in Issue #4 but setup/verification unclear. Need error tracking, performance monitoring, and uptime monitoring for production health.

## Problem
- Error tracking (Sentry) mentioned but setup unclear
- No application performance monitoring configured
- No uptime monitoring set up
- No alerting rules configured
- No monitoring dashboards accessible
- Cannot detect production issues proactively

## Scope
- Set up Sentry error tracking (if not already done):
  - Create Sentry project
  - Configure frontend error tracking
  - Configure backend error tracking
  - Test error reporting
- Configure application performance monitoring:
  - WebSocket connection metrics
  - API endpoint response times
  - Chat start/end events
  - Radar update frequency
- Set up uptime monitoring:
  - Health check endpoint monitoring
  - Service availability tracking
- Create alerting rules:
  - Error rate thresholds
  - Performance degradation alerts
  - Service downtime alerts
- Document monitoring dashboard access
- Create monitoring runbook in `docs/monitoring/RUNBOOK.md`

## Acceptance
- Sentry error tracking operational (frontend + backend)
- Performance metrics being collected
- Uptime monitoring active
- Alerting rules configured and tested
- Monitoring dashboards accessible to team
- Monitoring runbook complete
- Team can respond to alerts

## Success Metrics
- Error tracking captures all exceptions
- Performance metrics visible in dashboard
- Uptime monitoring alerts on downtime
- Alert response time < 5 minutes
- Zero false-positive alerts

## Related
- Issue #4: Integration Testing & Launch Preparation (Sentry mentioned)
- Issue #10: Performance Verification (will provide performance baselines)
- Issue #11: Production Deployment Infrastructure (monitoring needed for production)

## Out of Scope
- Advanced analytics (post-MVP)
- User behavior tracking (privacy-first, minimal tracking)
- Cost monitoring (post-MVP)
"@
        labels = @("status:plan", "infrastructure", "agent:nexus", "agent:pixel", "monitoring")
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
        Write-Host "✅ Created Issue #$($response.number): $($response.title)"
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

