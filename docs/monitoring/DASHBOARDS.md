# Monitoring Dashboards Access Guide

**Last Updated**: 2025-11-15  
**Purpose**: Document access to monitoring dashboards and status pages

## Sentry Dashboards

### Error Dashboard

**Purpose**: View and investigate errors from frontend and backend

**Access**:
- URL: [Sentry Dashboard URL - to be added after account creation]
- Login: Use team Sentry account credentials
- Projects:
  - **Icebreaker Frontend** (React project)
  - **Icebreaker Backend** (Node.js project)

**Features**:
- Error grouping and trends
- Stack traces and context
- User impact analysis
- Error frequency and distribution

**Usage**:
- Review new errors daily
- Investigate critical errors immediately
- Track error rate trends over time

### Performance Dashboard

**Purpose**: Monitor application performance metrics

**Access**:
- URL: [Sentry Performance Dashboard URL - to be added after account creation]
- Login: Use team Sentry account credentials

**Metrics Tracked**:
- **WebSocket Message Handling**: Average duration, P50/P95/P99 latencies
- **Signal Engine Calculations**: Average duration, P50/P95/P99 latencies
- **API Endpoints**: Response times, throughput
- **Transaction Overview**: Total transactions, error rate, throughput

**Key Metrics**:
- P50 latency: < 200ms (target)
- P95 latency: < 1s (target, alert threshold)
- P99 latency: < 2s (target)
- Error rate: < 5 errors/minute (target)

**Usage**:
- Monitor performance trends daily
- Identify slow operations
- Correlate performance with errors
- Track performance regressions

### Custom Performance Dashboard

**Status**: To be created after Sentry account setup

**Planned Metrics**:
- WebSocket connection count over time
- Signal Engine calculation frequency
- Chat start latency
- Radar update latency

**Configuration**:
- Create custom dashboard in Sentry
- Add widgets for key metrics
- Set up time-based views (1h, 24h, 7d, 30d)

## UptimeRobot Status Page

**Purpose**: Public status page for service uptime

**Access**:
- URL: [UptimeRobot Status Page URL - to be added after account creation]
- Public: Yes (no login required)
- Update Frequency: Every 5 minutes

**Information Displayed**:
- Current status (Up/Down)
- Uptime percentage (last 24h, 7d, 30d)
- Response time history
- Incident history

**Usage**:
- Share with stakeholders for uptime visibility
- Monitor during incidents
- Track uptime trends

## Dashboard Access Summary

| Dashboard | URL | Access | Status |
|-----------|-----|--------|--------|
| Sentry Error Dashboard | [To be added] | Team credentials | PENDING |
| Sentry Performance Dashboard | [To be added] | Team credentials | PENDING |
| UptimeRobot Status Page | [To be added] | Public | PENDING |

## Access Credentials

**Storage**: Credentials stored securely (not in this file)
- Sentry credentials: See team password manager
- UptimeRobot credentials: See team password manager

**Access Request**: Contact @Nexus 🚀 for dashboard access

## Dashboard Maintenance

**Regular Tasks**:
- Review dashboards daily for errors and performance issues
- Update dashboard configurations as needed
- Document new metrics or changes
- Share dashboard access with new team members

**Dashboard Updates**:
- Update this file when dashboard URLs are available
- Document any custom dashboards created
- Note any access changes or credential updates

---

**Next Steps**: 
1. Create Sentry account and projects
2. Configure dashboards in Sentry
3. Create UptimeRobot account and status page
4. Update this file with actual dashboard URLs
5. Share access credentials with team

See `Docs/plans/Issue-22-plan-status-IN-PROGRESS.md` Step 5 for detailed setup steps.

