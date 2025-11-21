# Research Log

## How to record

When researching a topic for an issue or feature:

1. Document the research question clearly
2. List constraints and existing infrastructure
3. Gather 3-5 high-signal sources (official docs, primary sources)
4. Summarize findings with key takeaways
5. Provide recommendations with trade-offs
6. Document rollback options

## Checklist for each lookup

- [ ] Research question is clearly stated
- [ ] Constraints are documented (stack, scope, existing infrastructure)
- [ ] Sources are cited with URLs and key takeaways
- [ ] Findings are summarized with actionable insights
- [ ] Recommendations include trade-offs and default choice
- [ ] Rollback options are documented

## Example entry

### Research Question

What deployment platform should we use for the frontend and backend?

### Constraints

- **Stack**: React frontend, Express backend
- **Scope**: Production deployment with SSL, environment variables, rollback capability
- **Existing Infrastructure**: GitHub Actions for CI/CD

### Sources & Findings

1. **Vercel Documentation**: Frontend deployment with automatic SSL, preview deployments, environment variable management
2. **Railway Documentation**: Backend deployment with PostgreSQL, WebSocket support, environment variables
3. **Comparison**: Vercel optimized for frontend, Railway for full-stack with databases

### Recommendations Summary

- **Frontend**: Vercel (automatic SSL, preview deployments, CDN)
- **Backend**: Railway (database support, WebSocket support, flexible deployment)

### Rollback Options

1. Revert to previous deployment via Vercel/Railway dashboard
2. Use environment variable rollback
3. Manual deployment via CLI if dashboard unavailable

