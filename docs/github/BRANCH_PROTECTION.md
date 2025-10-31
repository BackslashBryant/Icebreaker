# Branch Protection Checklist

Apply these rules to the `main` (and optionally `develop`) branch once automation is ready:

1. **Require pull request reviews**
   - Minimum of 1 approval (increase if your team prefers).
   - Dismiss stale reviews when new commits are pushed.
2. **Require status checks to pass before merging**
   - Add `Template CI`.
   - Add any stack-specific jobs you introduce (lint, build, e2e).
3. **Require branches to be up-to-date before merging** (optional but recommended).
4. **Restrict who can push**
   - Allow only specific teams/users if you want to enforce PR-only merges.
5. **Require signed commits** (optional, based on your organization policy).
6. **Enforce for administrators** so the rules apply to everyone.

Document any deviations from this list in `/docs/Plan.md` or your project handbook so the agent workflow stays predictable.
