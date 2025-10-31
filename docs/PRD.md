_Template placeholder. Replace with the PRD for your real project once the stack is generated._

# Product Requirements Document (PRD)

## 1. Overview
**Product**: Cursor Agent Workspace Template  
**Purpose**: Provide a stack-agnostic starting point that guides a solo builder through a realistic multi-agent workflow, from planning to docs, using Cursor 2.0 sequential agents and MCP integrations.  
**Target Audience**: Hobbyists and indie developers who want automation guardrails without committing to a specific tech stack up front.

## 2. Goals / Success Metrics
- **Primary Goal**: Make it trivial to kick off a Cursor Plan, run the agent roster sequentially, and document research with auditable MCP citations.
- **Secondary Goals**:
  - Keep the template stack-neutral so any generated project can plug in.
  - Offer optional guardrails (path-scope hook, preflight, sanity scripts) that are easy to opt into.
  - Provide ready-to-copy prompts, setup steps, and kickoff messaging so onboarding is copy/paste simple.
- **Success Metrics**:
  - `npm run preflight` passes on a fresh clone.
  - Agents can be provisioned locally using only the prompts in `/docs/agents/prompts`.
  - Kickoff template and sanity flow exercised without touching extra configuration.

## 3. Core Features
- **Agent Workflow Kit**: Roster, setup guide, prompts, kickoff template, and plan scaffold synced to a strict Vector -> Pixel -> Implementers -> Muse/Nexus/Sentinel flow.
- **Research Logging**: `/docs/research.md` structure for Docfork/Search MCP citations, including checklist and example entries.
- **Optional Guardrails**: Path-scope pre-commit sample, preflight validator, and CLI helpers to install hooks or print prompts.
- **MCP Scaffolding**: `.cursor/mcp.json` placeholders plus docs guiding environment variables and usage expectations.
- **Verify Helper**: `scripts/verify-all` to forward lint/test/build commands once the generated stack defines them.

## 4. Architecture Summary
- **Application Stack**: Deliberately unspecified; users plug in their generated stack.
- **Automation**: Node-based tooling for preflight, prompt export, and optional hook installation.
- **CI/CD**: GitHub Action that runs the agent-focused preflight and `verify-all` script.
- **Research & Security**: Docs scaffolding for Scout/Sentinel to log findings and risks.

## 5. Data Model
- **Docs**: `/docs/Plan.md`, `/docs/research.md`, `/docs/agents/` provide the durable records for planning, research, and onboarding.
- **Automation Scripts**: `tools/*.mjs` contain small, auditable Node utilities (preflight, hook install, prompt export).
- **Optional Hooks**: `scripts/hooks/pre-commit.sample` enforces path scopes when copied into `.git/hooks`.

## 6. Security / Privacy
- **Scope Guard**: Optional pre-commit hook restricts agent branches to their documented paths.
- **MCP Secrets**: `.env.example` and docs outline environment variables; no secrets checked in.
- **Audit Trail**: Research log and kickoff template encourage explicit citations and acceptance criteria before code lands.

## 7. Change Log
- **2025-01-30**: Pivoted from Spec Kit flows to Cursor 2.0 sequential agents, added preflight + hook/prompt helpers, refreshed documentation to match the new workflow.
