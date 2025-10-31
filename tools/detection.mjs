#!/usr/bin/env node

/**
 * Enhanced Auto-Detection
 *
 * Detects project type, existing configurations, and provides smart
 * recommendations for MCPs and agents based on the detected stack.
 *
 * Usage:
 *   node tools/detection.mjs [--json]
 */

import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const cachePath = path.join(repoRoot, '.cursor', 'detection-cache.json');

function safeReadJson(filePath) {
  if (!existsSync(filePath)) {
    return null;
  }
  try {
    return JSON.parse(readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

function hasDependency(pkg, matcher) {
  if (!pkg) return false;
  const deps = {
    ...(pkg.dependencies || {}),
    ...(pkg.devDependencies || {}),
  };
  return Object.keys(deps).some(dep => matcher(dep));
}

function hasFile(...segments) {
  return existsSync(path.join(repoRoot, ...segments));
}

function hasAnyFile(candidates) {
  return candidates.some(candidate =>
    Array.isArray(candidate) ? hasFile(...candidate) : hasFile(candidate),
  );
}

function listDir(dir) {
  const abs = path.join(repoRoot, dir);
  if (!existsSync(abs)) return [];
  try {
    return readdirSync(abs);
  } catch {
    return [];
  }
}

function detectProjectType(packageJson) {
  if (!packageJson) {
    return { type: 'template', confidence: 'high' };
  }

  const deps = {
    ...(packageJson.dependencies || {}),
    ...(packageJson.devDependencies || {}),
  };

  const indicators = [];

  // Framework detection
  if (deps.next) {
    indicators.push({ type: 'nextjs', confidence: 'high' });
  }
  if (deps.react && !deps.next) {
    indicators.push({ type: 'react', confidence: 'high' });
  }
  if (deps.vue) {
    indicators.push({ type: 'vue', confidence: 'high' });
  }
  if (deps.svelte) {
    indicators.push({ type: 'svelte', confidence: 'high' });
  }
  if (deps['@angular/core']) {
    indicators.push({ type: 'angular', confidence: 'high' });
  }

  // Backend detection
  if (deps.express || deps.fastify || deps.koa || deps.hapi) {
    indicators.push({ type: 'api', confidence: 'high' });
  }
  if (deps['@nestjs/core']) {
    indicators.push({ type: 'nestjs', confidence: 'high' });
  }

  // Mobile detection
  if (deps.react-native || deps['@react-native-community']) {
    indicators.push({ type: 'react-native', confidence: 'high' });
  }
  if (hasFile('android') || hasFile('ios')) {
    indicators.push({ type: 'mobile', confidence: 'medium' });
  }

  // Monorepo detection
  if (hasFile('pnpm-workspace.yaml') || hasFile('lerna.json') || hasFile('nx.json')) {
    indicators.push({ type: 'monorepo', confidence: 'high' });
  }
  if (packageJson.workspaces) {
    indicators.push({ type: 'monorepo', confidence: 'medium' });
  }

  // Database detection
  if (deps.supabase || hasFile('supabase')) {
    indicators.push({ type: 'supabase', confidence: 'high' });
  }
  if (deps.prisma || hasFile('prisma')) {
    indicators.push({ type: 'prisma', confidence: 'high' });
  }
  if (deps.typeorm || deps.sequelize || deps.mongoose) {
    indicators.push({ type: 'database', confidence: 'medium' });
  }

  // Testing detection
  if (deps.playwright || hasFile('playwright.config')) {
    indicators.push({ type: 'playwright', confidence: 'high' });
  }
  if (deps['@testing-library/react'] || deps['@testing-library/vue']) {
    indicators.push({ type: 'testing-library', confidence: 'medium' });
  }

  if (indicators.length === 0) {
    return { type: 'generic', confidence: 'low' };
  }

  // Return primary type (highest confidence)
  const primary = indicators.sort((a, b) => {
    const confOrder = { high: 3, medium: 2, low: 1 };
    return confOrder[b.confidence] - confOrder[a.confidence];
  })[0];

  return {
    type: primary.type,
    confidence: primary.confidence,
    allTypes: indicators.map(i => i.type),
  };
}

function detectGitHubRepo() {
  try {
    const remote = execSync('git config --get remote.origin.url', {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();

    if (remote.includes('github.com')) {
      const match = remote.match(/github\.com[:/]([^/]+)\/([^/]+?)(?:\.git)?$/);
      if (match) {
        return {
          detected: true,
          owner: match[1],
          repo: match[2],
          fullName: `${match[1]}/${match[2]}`,
          url: remote,
        };
      }
    }
    return { detected: false };
  } catch {
    return { detected: false };
  }
}

function suggestMcps(packageJson, projectType) {
  const suggestions = [];
  const deps = {
    ...(packageJson?.dependencies || {}),
    ...(packageJson?.devDependencies || {}),
  };

  // Always suggest core MCPs
  suggestions.push({
    id: 'github',
    reason: 'Core MCP for repository operations',
    required: true,
  });
  suggestions.push({
    id: 'docfork',
    reason: 'Core MCP for documentation lookup',
    required: true,
  });
  suggestions.push({
    id: 'desktop-commander',
    reason: 'Core MCP for local operations',
    required: true,
  });

  // Stack-specific suggestions
  if (hasDependency(packageJson, dep => dep.includes('supabase')) || hasFile('supabase')) {
    suggestions.push({
      id: 'supabase',
      reason: 'Detected Supabase dependency or config',
      required: false,
    });
  }

  if (
    hasDependency(packageJson, dep => dep.includes('playwright')) ||
    hasFile('playwright.config')
  ) {
    suggestions.push({
      id: 'playwright',
      reason: 'Detected Playwright for UI testing',
      required: false,
    });
  }

  if (hasDependency(packageJson, dep => dep === 'vercel') || hasFile('vercel.json')) {
    suggestions.push({
      id: 'vercel',
      reason: 'Detected Vercel deployment',
      required: false,
    });
  }

  if (hasDependency(packageJson, dep => dep.startsWith('stripe')) || hasFile('stripe.yaml')) {
    suggestions.push({
      id: 'stripe',
      reason: 'Detected Stripe integration',
      required: false,
    });
  }

  return suggestions;
}

function suggestAgents(projectType) {
  const suggestions = [];

  // Always suggest core agents
  suggestions.push('vector', 'pixel', 'muse', 'nexus');

  // Stack-specific agents
  if (
    projectType.allTypes?.includes('nextjs') ||
    projectType.allTypes?.includes('react') ||
    projectType.allTypes?.includes('vue') ||
    projectType.allTypes?.includes('svelte')
  ) {
    suggestions.push('link');
  }

  if (projectType.allTypes?.includes('api') || projectType.allTypes?.includes('nestjs')) {
    suggestions.push('forge');
  }

  if (
    projectType.allTypes?.includes('react-native') ||
    projectType.allTypes?.includes('mobile')
  ) {
    suggestions.push('glide', 'apex', 'cider');
  }

  if (projectType.allTypes?.includes('playwright') || projectType.allTypes?.includes('testing-library')) {
    // Pixel already included
  }

  // Research and security always available
  suggestions.push('scout', 'sentinel');

  return [...new Set(suggestions)]; // Remove duplicates
}

function generateReport(packageJson, projectType, githubRepo, mcpSuggestions, agentSuggestions) {
  return {
    timestamp: new Date().toISOString(),
    projectType,
    githubRepo,
    mcpSuggestions,
    agentSuggestions,
    recommendations: {
      nextSteps: [
        projectType.type === 'template'
          ? 'This appears to be a template. Run `npm run setup` to configure.'
          : `Detected ${projectType.type} project. Continue with setup.`,
        githubRepo.detected
          ? `GitHub repo detected: ${githubRepo.fullName}`
          : 'No GitHub repo detected. Consider initializing git and adding a remote.',
        `Suggested MCPs: ${mcpSuggestions.map(m => m.id).join(', ')}`,
        `Suggested agents: ${agentSuggestions.join(', ')}`,
      ],
    },
  };
}

function printHuman(report) {
  console.log('\n🔍 Project Detection Report\n');
  console.log('='.repeat(50));

  console.log(`\n📦 Project Type: ${report.projectType.type}`);
  console.log(`   Confidence: ${report.projectType.confidence}`);
  if (report.projectType.allTypes && report.projectType.allTypes.length > 1) {
    console.log(`   All types: ${report.projectType.allTypes.join(', ')}`);
  }

  console.log(`\n🔗 GitHub Repository:`);
  if (report.githubRepo.detected) {
    console.log(`   ✅ Detected: ${report.githubRepo.fullName}`);
    console.log(`   URL: ${report.githubRepo.url}`);
  } else {
    console.log(`   ❌ No GitHub repository detected`);
  }

  console.log(`\n🔌 MCP Suggestions:`);
  report.mcpSuggestions.forEach(suggestion => {
    const icon = suggestion.required ? '✅' : '💡';
    console.log(`   ${icon} ${suggestion.id} - ${suggestion.reason}`);
  });

  console.log(`\n🤖 Agent Suggestions:`);
  console.log(`   Suggested: ${report.agentSuggestions.join(', ')}`);

  console.log(`\n📋 Next Steps:`);
  report.recommendations.nextSteps.forEach((step, index) => {
    console.log(`   ${index + 1}. ${step}`);
  });

  console.log(`\n💡 Quick Commands:`);
  console.log(`   npm run mcp:suggest -- --install all`);
  console.log(`   npm run setup:agents`);
  console.log(`   npm run status\n`);
}

function main() {
  const packageJson = safeReadJson(path.join(repoRoot, 'package.json'));
  const projectType = detectProjectType(packageJson);
  const githubRepo = detectGitHubRepo();
  const mcpSuggestions = suggestMcps(packageJson, projectType);
  const agentSuggestions = suggestAgents(projectType);

  const report = generateReport(
    packageJson,
    projectType,
    githubRepo,
    mcpSuggestions,
    agentSuggestions,
  );

  // Save cache
  const cacheDir = path.dirname(cachePath);
  if (!existsSync(cacheDir)) {
    mkdirSync(cacheDir, { recursive: true });
  }
  writeFileSync(cachePath, JSON.stringify(report, null, 2), 'utf8');

  // Output
  const wantsJson = process.argv.includes('--json');
  if (wantsJson) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    printHuman(report);
  }
}

try {
  main();
} catch (error) {
  console.error(
    `Detection failed: ${error instanceof Error ? error.message : error}`,
  );
  process.exit(1);
}
