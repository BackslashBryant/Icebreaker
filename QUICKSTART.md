# Quick Start

Get started in 3 steps:

## Step 1: Clone the Repository

```bash
git clone <your-repo-url>
cd cursor-template-project
```

## Step 2: Install Dependencies (Auto-Setup)

```bash
npm install
```

The postinstall hook runs your personal bootstrap (one-time GitHub token cache) and then `npm run setup` automatically. You can re-run the bootstrap at any time with `npm run personal:bootstrap`.

During this automated setup Cursor will:
- Check prerequisites (Node.js, npm, Git, Cursor)
- Detect the project configuration
- Ensure the GitHub token is staged from personal config
- Configure MCP servers
- Run preflight checks
- Generate the Cursor guides
- Auto-refresh detection and agent state when dependencies change
- Install the template pre-commit guard (if one isn’t present)

**Time**: ~5 minutes (hands-off)

## Step 3: Start Coding

Once setup is complete:

1. **Configure Cursor IDE** (if not done during setup):
   ```bash
   npm run setup:cursor
   ```
   Follow: `docs/cursor/SETTINGS_GUIDE.md`

2. **Install Extensions**:
   ```bash
   npm run setup:extensions
   ```

3. **(Optional) Create Agents**:
   ```bash
   npm run setup:agents
   ```
   Follow: `docs/agents/CREATE_AGENTS.md`
   The command seeds `.cursor/agents-state.json`; rerun with `npm run setup:agents -- --sync-state` after each session to keep the roster current while you tick off created agents.

   **Note**: Agents are optional! Persona rules in `.cursor/rules/persona-*.mdc` automatically activate when you open matching files (e.g., opening `docs/Plan.md` wakes Vector 🎯, editing `tests/**` wakes Pixel 🖥️). You only need saved agents if you want them pinned in the Cursor sidebar.

4. **Verify Everything**:
   ```bash
   npm run status
   npm run test:personas    # optional: validate persona auto-routing
   ```

5. **Kick Off Work**:
   - Review `docs/Plan.md` (pre-seeded webapp plan)
   - Create a GitHub issue using the **0 - Spec** template
   - See `docs/agents/KICKOFF.md` for the kickoff prompt
   - Generate a PR draft with `npm run github:pr -- --dry-run` (add `-- --push` to publish the branch)
   - (Optional) Replace the seeded MVP: `npm run feature:new`

---

## Auto-Routing (Default Behavior)

Persona rules automatically activate when you work with matching files:

- **Vector 🎯** → Opens when editing `docs/Plan.md` or `.notes/features/**`
- **Pixel 🖥️** → Opens when editing `tests/**` or test config files
- **Forge 🔗** → Opens when editing `api/**`, `server/**`, `db/**`, etc.
- **Link 🌐** → Opens when editing `src/**`, `app/**`, `components/**`, etc.
- **Glide 📳** → Opens when editing PWA files (`pwa/**`, `sw.js`, etc.)
- **Apex 🤖** → Opens when editing `android/**`
- **Cider 🍏** → Opens when editing `ios/**`
- **Muse 🎨** → Opens when editing `docs/**`, `README.md`, `CHANGELOG.md`
- **Nexus 🚀** → Opens when editing `.github/**`, CI configs, Dockerfiles
- **Scout 🔎** → Opens when editing `docs/research.md`
- **Sentinel 🛡️** → Opens when editing `docs/security/**`

No manual setup required—just open the file and the right teammate joins the conversation!

- **Full Documentation**: See `README.md` for the comprehensive guide
- **First Run Guide**: See `docs/FIRST_RUN.md` for the detailed walkthrough
- **Agent Details**: See `docs/agents/README.md`

---

## Troubleshooting

**Setup failed?**
- Run `npm run status` to see what is missing
- Confirm prerequisites: Node.js 18+, npm, Git, Cursor IDE
- Re-run `npm run personal:bootstrap` if the token changed

**Need help?**
- Check `docs/FIRST_RUN.md`
- Re-run `npm run status`
- Review generated guides in `docs/`

---

**Ready to code?** Launch Cursor, open `docs/Plan.md`, and follow the flow in `docs/process/MVP_LOOP.md`.
