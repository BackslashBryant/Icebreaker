#!/usr/bin/env node

/**
 * Agent Creation Helper
 *
 * Streamlines agent creation by generating step-by-step instructions
 * and providing copy-paste ready prompts.
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

function generateGuide() {
  const config = loadConfig();
  const agents = config.agents.sort((a, b) => a.sequentialOrder - b.sequentialOrder);

  let guide = `# Creating Cursor Agents

This guide provides step-by-step instructions for creating all ${agents.length} agents in Cursor IDE.

## Quick Overview

Agents are AI assistants configured with specific prompts, model preferences, and tool access. They work together in a sequential workflow to implement features from planning to deployment.

**Total agents**: ${agents.length}
**Estimated time**: 10-15 minutes
**Difficulty**: Easy (mostly copy-paste)

---

## Prerequisites

-  Cursor IDE installed and running
-  MCP servers configured (run \`npm run setup\` first)
-  Agent prompts available (run \`npm run agents:prompt -- list\` to verify)

---

## Step-by-Step Instructions

### Step 1: Open Agent Creation Panel

1. Open Cursor IDE
2. Click the **Agents** icon in the sidebar (or press \`Ctrl+I\` / \`Cmd+I\`)
3. Click **"New Agent"** button

---

## Agent Creation Steps

`;

  // Group agents by sequential order
  const orderGroups = {};
  agents.forEach(agent => {
    if (!orderGroups[agent.sequentialOrder]) {
      orderGroups[agent.sequentialOrder] = [];
    }
    orderGroups[agent.sequentialOrder].push(agent);
  });

  let stepNumber = 2;
  const sortedOrders = Object.keys(orderGroups).sort((a, b) => parseInt(a) - parseInt(b));

  for (const order of sortedOrders) {
    const groupAgents = orderGroups[order];

    for (const agent of groupAgents) {
      const prompt = loadPrompt(agent.name);
      const emojiDisplay = agent.emoji ? `${agent.emoji} ` : '';

      guide += `### Step ${stepNumber++}: Create ${emojiDisplay}${agent.displayName} (${agent.name})\n\n`;
      guide += `**Role**: ${agent.description}\n\n`;
      guide += `**Signature**: "${agent.signaturePhrase}"\n\n`;
      guide += `**Path Scope**: \`${agent.pathScope}\`\n\n`;

      guide += `**Steps**:\n\n`;
      guide += `1. **Name**: Enter exactly: \`${agent.name}\`\n\n`;
      guide += `2. **Prompt**: Copy and paste the following prompt:\n\n`;
      guide += `\`\`\`\n${prompt}\n\`\`\`\n\n`;

      guide += `3. **Model Hint**: Select **${agent.modelHint === 'reasoning' ? 'Reasoning-focused' : 'Code generation-focused'}** model\n`;
      guide += `   - Reasoning models: Claude 3.7 Sonnet, Gemini 2.5 Pro\n`;
      guide += `   - Codegen models: GPT-4, Claude Sonnet, Gemini Pro\n\n`;

      if (agent.mcpTools.length > 0) {
        guide += `4. **MCP Tools** (Optional but recommended):\n`;
        agent.mcpTools.forEach(tool => {
          guide += `   - Enable **${tool}** MCP server\n`;
        });
        guide += `\n`;
      } else {
        guide += `4. **MCP Tools**: None required for this agent\n\n`;
      }

      guide += `5. **Save**: Click "Save" or "Create"\n\n`;
      guide += `---\n\n`;
    }
  }

  guide += `## Batch Creation Tips

### Copy All Prompts at Once

Run this command to print all prompts:

\`\`\`bash
npm run agents:prompt -- all
\`\`\`

Then copy each prompt as you create the corresponding agent.

### Model Selection Quick Reference

- **Reasoning agents** (Vector, Pixel, Scout, Sentinel): Use Claude 3.7 Sonnet or Gemini 2.5 Pro
- **Codegen agents** (Forge, Link, Glide, Apex, Cider, Nexus, Muse): Use GPT-4, Claude Sonnet, or Gemini Pro

### MCP Tools Quick Reference

- **Docfork**: Documentation lookup (Vector, Scout, Forge, Link, Glide, Apex, Cider, Muse)
- **GitHub**: Repository operations (Vector, Forge, Link, Nexus, Scout)
- **Playwright**: UI testing (Link, Glide)

---

## Workflow Sequence

Agents work in this order:

\`\`\`
${config.workflow.description}
\`\`\`

1. **Vector**  Creates plan from GitHub Issue
2. **Pixel**  Scaffolds tests from acceptance criteria
3. **Implementers**  Build features (Forge/Link/Glide/Apex/Cider)
4. **Pixel**  Verifies implementation
5. **Muse**  Updates documentation
6. **Nexus**  Configures CI/CD and deployment
7. **Sentinel**  Security review (if needed)

**Scout** is called on-demand for research when needed.

---

## Verification

After creating all agents:

1. Verify all ${agents.length} agents appear in Cursor's Agent panel
2. Test with: Ask Vector to create a plan for a test issue
3. Update {{T}}.cursor/agents-state.json{{T}} with the agents you have created (the helper seeds it automatically; rerun {{T}}npm run setup:agents -- --sync-state{{T}} to refresh the roster)
4. Run: {{T}}npm run status{{T}} to check overall setup status

**Tip**: Keep .cursor/agents-state.json in sync so npm run status reflects reality. List the agent IDs you finish and update verifiedAt when everything is green.

---

## Troubleshooting
---

## Troubleshooting
---

## Troubleshooting
## Troubleshooting

### Agent Not Appearing

- **Check**: Did you click "Save" after creating?
- **Check**: Refresh Cursor IDE (restart if needed)
- **Check**: Verify agent name matches exactly (case-sensitive)

### Prompt Not Working

- **Check**: Copied entire prompt including all lines
- **Check**: No extra characters or formatting issues
- **Try**: Run \`npm run agents:prompt -- ${agents[0].name}\` to verify prompt format

### MCP Tools Not Available

- **Check**: MCP servers configured in \`.cursor/mcp.json\`
- **Check**: Environment variables set (run \`npm run status\`)
- **Check**: Cursor IDE restarted after MCP configuration

---

## Next Steps

1.  Create all ${agents.length} agents using instructions above
2.  Verify agents are working: \`npm run status\`
3.  Start your first feature: See \`docs/agents/KICKOFF.md\`

---

## Related Documentation

- \`docs/agents/README.md\` - Agent roster and detailed descriptions
- \`docs/agents/SETUP.md\` - Quick setup reference
- \`docs/agents/KICKOFF.md\` - Kickoff template for starting work
- \`docs/cursor/models.md\` - Model selection guide

---

_This guide was generated from \`.cursor/agents-config.json\`. Run \`npm run setup:agents\` to regenerate._
`;

  guide = guide.replace(/{{T}}/g, '`');

  return { guide, agents };
}

function toAscii(input) {
  const map = new Map([
    ['', '[done]'],
    ['', '[warn]'],
    ['', ''],
    ['', '[fail]'],
    ['', 'OK'],
    ['', '->'],
    ['', ''],
    ['', '-'],
    ['', '-'],
    ['', "'"],
    ['', "'"],
    ['', '"'],
    ['', '"'],
    ['', '*'],
    ['', '*'],
    ['', ' '],
  ]);

  let output = '';
  for (const ch of input) {
    if (ch.charCodeAt(0) < 128) {
      output += ch;
    } else if (map.has(ch)) {
      output += map.get(ch);
    }
  }
  return output;
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
    writeFileSync(statePath, `${JSON.stringify(template, null, 2)}
`, 'utf8');
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
      writeFileSync(statePath, `${JSON.stringify(nextState, null, 2)}
`, 'utf8');
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
    const sanitizedGuide = toAscii(guide);

    // Ensure directory exists
    const outputDir = path.dirname(outputPath);
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }

    writeFileSync(outputPath, sanitizedGuide, 'utf8');
    console.log(`Generated: ${path.relative(repoRoot, outputPath)}`);
    console.log('\nNext steps:');
    ensureAgentState(agents);
    console.log('  1. Open the generated guide: docs/agents/CREATE_AGENTS.md');
    console.log('  2. Follow the step-by-step instructions');
    console.log('  3. Create all agents in Cursor IDE');
    console.log('  4. Verify with: npm run status');
  } catch (error) {
    console.error(
      `Error: ${error instanceof Error ? error.message : error}`,
    );
    process.exit(1);
  }
}

main();




