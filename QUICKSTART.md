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

3. **Create Agents**:
   ```bash
   npm run setup:agents
   ```
   Follow: `docs/agents/CREATE_AGENTS.md`

4. **Verify Everything**:
   ```bash
   npm run status
   ```

5. **Kick Off Work**:
   - Review `docs/Plan.md` (pre-seeded webapp plan)
   - Create a GitHub issue using the **0 - Spec** template
   - See `docs/agents/KICKOFF.md` for the kickoff prompt
   - (Optional) Replace the seeded MVP: `npm run feature:new`

---

## What's Next?

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


