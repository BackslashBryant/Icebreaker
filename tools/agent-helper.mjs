#!/usr/bin/env node

/**
 * Agent Creation Helper
 *
 * Generates a lightweight checklist for creating the roster in Cursor IDE
 * and keeps the optional agent-state file in sync.
 *
 * Usage:
 *   npm run setup:agents
 *   npm run setup:agents -- --sync-state   # Refresh the state template
 *   npm run setup:agents -- --no-state     # Skip state file updates
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const configPath = path.join(repoRoot, '.cursor', 'agents-config.json');
const promptsDir = path.join(repoRoot, 'docs', 'agents', 'prompts');
const outputPath = path.join(repoRoot, 'docs', 'agents', 'CREATE_AGENTS.md');
const statePath = path.join(repoRoot, '.cursor', 'agents-state.json');

const args = process.argv.slice(2);
const skipStateSync = args.includes('--no-state');
const refreshState = args.includes('--sync-state');

function loadConfig() {
  if (!existsSync(configPath)) {
    throw new Error(`Agent config not found: ${configPath}`);
  }
  return JSON.parse(readFileSync(configPath, 'utf8'));
}

function loadPrompt(agentName) {
  const promptPath = path.join(promptsDir, `${agentName}.md`);
  if (!existsSync(promptPath)) {
    throw new Error(`Prompt not found for agent ${agentName}: ${promptPath}`);
  }
  return readFileSync(promptPath, 'utf8').trim();
}

function formatModelHint(agent) {
  return agent.modelHint === 'reasoning'
    ? 'Reasoning (Claude 3.7 Sonnet, Gemini 2.5 Pro)'
    : 'Codegen (GPT-4, Claude Sonnet, Gemini Pro)';
}

function formatMcpTools(agent) {
  if (!agent.mcpTools || agent.mcpTools.length === 0) {
    return 'None';
  }
  return agent.mcpTools.map(tool => `**${tool}**`).join(', ');
}

function generateGuide() {
  const config = loadConfig();
  const agents = [...config.agents].sort((a, b) => a.sequentialOrder - b.sequentialOrder);

  let guide = `# Creating Cursor Agents

Quick checklist for registering the ${agents.length} dev personas in Cursor. Keep \`docs/agents/PLAYBOOK.md\`, \`docs/vision.md\`, and \`docs/ConnectionGuide.md\` open so every prompt stays aligned.

## Before you start
- Run \`npm run setup\` (or \`npm install\`) so prompts/docs are generated.
- Open Cursor → **Agents** panel (\`Ctrl/Cmd + I\`) → **New Agent**.
- Optionally run \`npm run agents:prompt -- all\` to copy prompts from the terminal.
- Authenticate GitHub MCP (and any optional MCPs) before creating agents.

## Roster Setup
`;

  for (const agent of agents) {
    const prompt = loadPrompt(agent.name);
    const emoji = agent.emoji ? `${agent.emoji} ` : '';

    guide += `
### ${emoji}${agent.displayName} (\`${agent.name}\`)
- Role: ${agent.description}
- Path scope: \`${agent.pathScope}\`
- Model hint: ${formatModelHint(agent)}
- Recommended MCP: ${formatMcpTools(agent)}

Steps:
1. Name the agent exactly \`${agent.name}\`.
2. Paste the prompt below into the System prompt field.
3. Choose a ${agent.modelHint === 'reasoning' ? 'reasoning-focused' : 'code-generation-focused'} model.
4. Enable the recommended MCP servers (optional but encouraged).
5. Save.

Prompt:
\`\`\`
${prompt}
\`\`\`
`;
  }

  guide += `
## After creation
- Confirm every agent appears in Cursor IDE.
- Update \`.cursor/agents-state.json\` (copy from the example if needed) or rerun \`npm run setup:agents -- --sync-state\`.
- Skim \`docs/agents/PLAYBOOK.md\` + \`docs/agents/KICKOFF.md\` so Plan→Act etiquette is top-of-mind.
- Run \`npm run status\` to verify setup health before starting a feature.

_Generated from \`.cursor/agents-config.json\`. Rerun \`npm run setup:agents\` whenever the roster changes._
`;

  return { guide: guide.trim() + '\n', agents };
}

function ensureAgentState(agents) {
  if (skipStateSync) {
    return;
  }

  const agentNames = agents.map(agent => agent.name);
  const stateDir = path.dirname(statePath);
  if (!existsSync(stateDir)) {
    mkdirSync(stateDir, { recursive: true });
  }

  if (!existsSync(statePath)) {
    const template = {
      expectedAgents: agentNames,
      createdAgents: [],
      verifiedAt: null,
    };
    writeFileSync(statePath, `${JSON.stringify(template, null, 2)}\n`, 'utf8');
    console.log('Seeded agent state template at .cursor/agents-state.json');
    return;
  }

  if (refreshState) {
    try {
      const current = JSON.parse(readFileSync(statePath, 'utf8'));
      const existingCreated = Array.isArray(current.createdAgents) ? current.createdAgents : [];
      const filtered = existingCreated.filter(name => agentNames.includes(name));
      const nextState = {
        ...current,
        expectedAgents: agentNames,
        createdAgents: filtered,
      };
      writeFileSync(statePath, `${JSON.stringify(nextState, null, 2)}\n`, 'utf8');
      console.log('Synced agent roster in .cursor/agents-state.json');
    } catch (error) {
      console.warn('[warn] Failed to sync .cursor/agents-state.json:', error instanceof Error ? error.message : error);
    }
  }
}

function main() {
  console.log('Generating Agent Creation Guide...\n');

  try {
    const { guide, agents } = generateGuide();

    const outputDir = path.dirname(outputPath);
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }

    writeFileSync(outputPath, guide, 'utf8');
    console.log(`Generated: ${path.relative(repoRoot, outputPath)}`);

    ensureAgentState(agents);
    console.log('\nNext steps:');
    console.log('  1. Open docs/agents/CREATE_AGENTS.md in your editor.');
    console.log('  2. Create each agent in Cursor using the prompts provided.');
    console.log('  3. Update .cursor/agents-state.json once finished.');
    console.log('  4. Run npm run status to confirm setup health.');
  } catch (error) {
    console.error(`Error: ${error instanceof Error ? error.message : error}`);
    process.exit(1);
  }
}

main();
