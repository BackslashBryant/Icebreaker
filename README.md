# Cursor Workspace Template

A stack-agnostic starting point for Cursor projects. It focuses on workflow automation (Spec Kit + MCP), lightweight preflight checks, and leaves the actual application stack for you or the agent to generate.

## What you get

- **Spec Kit ready**: `/constitution`, `/specify`, `/clarify`, `/plan`, `/tasks`, `/implement` are expected to drive complex work.
- **MCP scaffolding**: `.cursor/mcp.json` includes placeholders for GitHub, Supabase, Playwright, DocFork, and Desktop Commander servers�configure them with environment variables or prompt inputs.
- **Preflight check**: `npm run preflight` calls the platform script (`.specify/scripts/.../check-prerequisites`) to ensure Spec Kit + MCP tooling is wired in before you start coding.
- **Verify helper**: `scripts/verify-all` discovers whatever `npm run` scripts your generated project exposes and runs them sequentially or in parallel.
- **Examples folder**: `examples/automation/` stores optional git/security helpers you can copy into a real project once you decide on tooling.

## Typical workflow

1. Clone this repo and configure `.cursor/mcp.json` (use inputs or env vars for secrets).
2. Run `/constitution` and `/specify` inside Cursor to define your new project.
3. Execute `npm run preflight` to confirm Spec Kit + MCP setup is complete.
4. Let Cursor generate the stack (frontend, backend, CLI, etc.) based on the spec.
5. Wire your stack�s lint/test/build commands into `package.json` so `npm run verify` works.
6. Extend `.github/workflows/ci.yml` with jobs that match your stack.

## Customising

- **Docs**: Everything under `docs/` is a template�replace or delete once you create project-specific content.
- **Automation**: Copy anything useful from `examples/automation/` into your project and update the rules/workflows accordingly.
- **Rules**: Update `.cursor/rules/*.mdc` to reflect your team�s conventions, but keep them consistent with the automation.
- **CI**: The default workflow only runs the preflight + verify helper. Expand it when you know which tools to run.

## Commands

```bash
npm run preflight   # ensures Spec Kit + MCP wiring is healthy
npm run verify      # runs scripts/verify-all (adapts to whatever your project exposes)
```

## Next steps after scaffolding

- Install dependencies for the stack Cursor generates.
- Keep secrets in environment variables or secret managers.
- Document lessons learned in `.cursor/rules/07-process-improvement.mdc`.
- Use MCP automation (GitHub, Playwright, DocFork, Supabase) to stay issue-first and auditable.

Happy building!