# GitHub API Utilities

This directory contains shared utilities for GitHub API operations.

## `github-api.mjs`

**Purpose**: Centralized GitHub API utilities using REST API (not GraphQL) for reliability.

**Key Features**:
- **REST API Primary**: All operations use REST API endpoints (`/repos/{owner}/{repo}/issues`, etc.)
- **Keyring-First Token Retrieval**: Automatically gets token from GitHub CLI keyring (`gh auth token`) first, then falls back to `GITHUB_TOKEN` env var
- **Prevents Auth Issues**: Avoids problems with expired/invalid env vars by using keyring as primary source

**Usage**:
```javascript
import { getRepo, createIssue, listIssues } from './lib/github-api.mjs';

const repo = getRepo();
const issues = await listIssues(repo, { state: 'open', per_page: 10 });
const newIssue = await createIssue(repo, { title: 'Test', body: 'Body', labels: [] });
```

**Token Retrieval Priority**:
1. GitHub CLI keyring (`gh auth token`) - **PRIMARY** (most reliable)
2. Environment variables (`GITHUB_TOKEN` or `GH_TOKEN`) - **FALLBACK**

**Important**: Do NOT set `GITHUB_TOKEN` in `.env` file - it interferes with GitHub CLI authentication. Tools get token from keyring automatically.

**All GitHub Tools Use This**:
- `tools/verify-github-issue.mjs`
- `tools/github-issue.mjs`
- `tools/github-pr.mjs`
- `tools/github-init-issues.mjs`
- `tools/github-labels.mjs`

