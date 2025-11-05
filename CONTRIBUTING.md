# Contributing

1. Work on a feature branch (`git checkout -b feat/<task-slug>`). Never push to the default branch.
2. Keep diffs scoped to the request. No unrelated refactors, formatting sweeps, or file moves.
3. Run the guard checks before opening a PR:
   ```bash
   npm run precommit
   ```
4. Open a pull request that includes:
   - Summary of the task
   - Risks and rollback plan
   - Output from `npm run precommit`
5. A maintainer must approve before merging.
