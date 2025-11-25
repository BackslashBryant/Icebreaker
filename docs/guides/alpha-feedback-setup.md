# Alpha Testing Feedback Collection Setup

**Purpose**: Lightweight feedback collection for alpha testers without building a dedicated system.

## Recommended Approach

### Option 1: Google Form (Easiest)

1. **Create Google Form** with fields:
   - Session ID (text)
   - Tester Name/Email (optional)
   - Issue Type (dropdown: Bug / Feature Request / Question / Other)
   - Description (paragraph)
   - Steps to Reproduce (paragraph)
   - Browser/Device (text)
   - Screenshot (file upload)

2. **Link from alpha guide**: Add form URL to `Docs/guides/alpha-testing.md`

3. **Correlate with Sentry**:
   - Export form responses to CSV
   - Match session IDs with Sentry events
   - Review feedback alongside error logs

### Option 2: GitHub Issues (Developer-Friendly)

1. **Create issue template**: `.github/ISSUE_TEMPLATE/alpha-feedback.md`
2. **Link from alpha guide**: Direct link to "New Issue" with template
3. **Auto-label**: Use GitHub Actions to label alpha feedback issues

### Option 3: Simple Feedback Endpoint (Future)

If feedback volume grows, add a simple endpoint:
- `POST /api/feedback` - Stores feedback with session ID
- View in admin dashboard or export to CSV
- Correlate with Sentry automatically

---

## Current Setup

**Status**: 📋 **TO BE CONFIGURED**

**Recommended**: Start with Google Form, upgrade to GitHub Issues or custom endpoint if needed.

**Form Fields** (recommended):
- Session ID (required)
- Issue Type (Bug / Feature Request / Question / Other)
- Description (required)
- Browser/Device
- Screenshot (optional)

**Correlation Process**:
1. Export form responses weekly
2. Match session IDs with Sentry events
3. Review feedback + errors together
4. Create GitHub issues for actionable items

---

## Implementation Steps

1. **Create feedback form** (Google Form or GitHub Issue template)
2. **Add link to alpha guide**: Update `Docs/guides/alpha-testing.md`
3. **Document correlation process**: This file
4. **Set up weekly review**: Export + correlate + triage

---

**Next Steps**: Create feedback form and link from alpha guide.

