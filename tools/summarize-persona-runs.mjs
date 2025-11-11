#!/usr/bin/env node

/**
 * Summarize Persona Test Runs
 * 
 * Aggregates telemetry data from persona test runs and generates feedback summary.
 * Identifies top friction patterns and trends.
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get project root (two levels up from tools/)
const projectRoot = path.resolve(__dirname, '..');

interface TelemetryData {
  persona: string;
  sessionId: string;
  timestamp: string;
  timings: {
    bootMs?: number;
    onboardingMs?: number;
    stepTimes?: Record<number, number>;
  };
  interactions: {
    stepsRetried: number;
    backButtonClicks: number;
    errorBannersEncountered: number;
  };
  accessibility: {
    a11yViolations?: number;
    focusOrderCorrect: boolean;
    visibleAffordances: {
      panicButton: boolean;
      visibilityToggle: boolean;
    };
  };
  errors: string[];
  metadata?: Record<string, any>;
}

interface AggregatedStats {
  persona: string;
  runCount: number;
  avgBootTime: number;
  avgOnboardingTime: number;
  totalRetries: number;
  totalErrors: number;
  a11yIssues: number;
  affordanceIssues: number;
}

interface FrictionPattern {
  pattern: string;
  count: number;
  severity: 'low' | 'medium' | 'high';
}

/**
 * Read all telemetry files from artifacts/persona-runs/
 */
function readTelemetryFiles(): TelemetryData[] {
  const runsDir = path.join(projectRoot, 'artifacts', 'persona-runs');
  
  if (!fs.existsSync(runsDir)) {
    return [];
  }

  const files = fs.readdirSync(runsDir).filter((f) => f.endsWith('.json'));
  const data: TelemetryData[] = [];

  for (const file of files) {
    try {
      const content = fs.readFileSync(path.join(runsDir, file), 'utf-8');
      const parsed = JSON.parse(content);
      data.push(parsed);
    } catch (error) {
      console.error(`Error reading ${file}:`, error);
    }
  }

  return data;
}

/**
 * Aggregate stats by persona
 */
function aggregateStats(data: TelemetryData[]): Map<string, AggregatedStats> {
  const stats = new Map<string, AggregatedStats>();

  for (const run of data) {
    const persona = run.persona || 'unknown';
    
    if (!stats.has(persona)) {
      stats.set(persona, {
        persona,
        runCount: 0,
        avgBootTime: 0,
        avgOnboardingTime: 0,
        totalRetries: 0,
        totalErrors: 0,
        a11yIssues: 0,
        affordanceIssues: 0,
      });
    }

    const stat = stats.get(persona)!;
    stat.runCount++;

    if (run.timings?.bootMs) {
      stat.avgBootTime = (stat.avgBootTime * (stat.runCount - 1) + run.timings.bootMs) / stat.runCount;
    }

    if (run.timings?.onboardingMs) {
      stat.avgOnboardingTime = (stat.avgOnboardingTime * (stat.runCount - 1) + run.timings.onboardingMs) / stat.runCount;
    }

    stat.totalRetries += run.interactions?.stepsRetried || 0;
    stat.totalErrors += run.errors?.length || 0;

    if (run.accessibility?.a11yViolations) {
      stat.a11yIssues += run.accessibility.a11yViolations;
    }

    if (!run.accessibility?.visibleAffordances?.panicButton) {
      stat.affordanceIssues++;
    }
    if (!run.accessibility?.visibleAffordances?.visibilityToggle) {
      stat.affordanceIssues++;
    }
  }

  return stats;
}

/**
 * Identify top friction patterns
 */
function identifyFrictionPatterns(data: TelemetryData[]): FrictionPattern[] {
  const patterns: Map<string, number> = new Map();

  for (const run of data) {
    // Slow boot time
    if (run.timings?.bootMs && run.timings.bootMs > 3000) {
      patterns.set('slow-boot', (patterns.get('slow-boot') || 0) + 1);
    }

    // Slow onboarding
    if (run.timings?.onboardingMs && run.timings.onboardingMs > 30000) {
      patterns.set('slow-onboarding', (patterns.get('slow-onboarding') || 0) + 1);
    }

    // Step retries
    if (run.interactions?.stepsRetried > 0) {
      patterns.set('step-retries', (patterns.get('step-retries') || 0) + run.interactions.stepsRetried);
    }

    // Error banners
    if (run.interactions?.errorBannersEncountered > 0) {
      patterns.set('error-banners', (patterns.get('error-banners') || 0) + run.interactions.errorBannersEncountered);
    }

    // A11y violations
    if (run.accessibility?.a11yViolations && run.accessibility.a11yViolations > 0) {
      patterns.set('a11y-violations', (patterns.get('a11y-violations') || 0) + run.accessibility.a11yViolations);
    }

    // Missing affordances
    if (!run.accessibility?.visibleAffordances?.panicButton) {
      patterns.set('missing-panic-button', (patterns.get('missing-panic-button') || 0) + 1);
    }
    if (!run.accessibility?.visibleAffordances?.visibilityToggle) {
      patterns.set('missing-visibility-toggle', (patterns.get('missing-visibility-toggle') || 0) + 1);
    }

    // Errors
    if (run.errors && run.errors.length > 0) {
      patterns.set('runtime-errors', (patterns.get('runtime-errors') || 0) + run.errors.length);
    }
  }

  // Convert to array and assign severity
  const frictionPatterns: FrictionPattern[] = Array.from(patterns.entries()).map(([pattern, count]) => {
    let severity: 'low' | 'medium' | 'high' = 'low';
    if (count >= 10) severity = 'high';
    else if (count >= 5) severity = 'medium';

    return { pattern, count, severity };
  });

  // Sort by count descending
  frictionPatterns.sort((a, b) => b.count - a.count);

  return frictionPatterns.slice(0, 5); // Top 5
}

/**
 * Generate feedback markdown
 */
function generateFeedbackMarkdown(
  stats: Map<string, AggregatedStats>,
  frictionPatterns: FrictionPattern[],
): string {
  const lines: string[] = [];

  lines.push('# Persona Test Feedback Summary');
  lines.push('');
  lines.push(`**Generated**: ${new Date().toISOString()}`);
  lines.push('');

  // Overall stats
  lines.push('## Overall Statistics');
  lines.push('');
  const totalRuns = Array.from(stats.values()).reduce((sum, s) => sum + s.runCount, 0);
  lines.push(`- **Total Runs**: ${totalRuns}`);
  lines.push(`- **Personas Tested**: ${stats.size}`);
  lines.push('');

  // Per-persona stats
  lines.push('## Per-Persona Statistics');
  lines.push('');
  for (const stat of Array.from(stats.values())) {
    lines.push(`### ${stat.persona}`);
    lines.push(`- **Runs**: ${stat.runCount}`);
    lines.push(`- **Avg Boot Time**: ${Math.round(stat.avgBootTime)}ms`);
    lines.push(`- **Avg Onboarding Time**: ${Math.round(stat.avgOnboardingTime)}ms`);
    lines.push(`- **Total Retries**: ${stat.totalRetries}`);
    lines.push(`- **Total Errors**: ${stat.totalErrors}`);
    lines.push(`- **A11y Issues**: ${stat.a11yIssues}`);
    lines.push(`- **Affordance Issues**: ${stat.affordanceIssues}`);
    lines.push('');
  }

  // Top friction patterns
  lines.push('## Top 5 Friction Patterns');
  lines.push('');
  if (frictionPatterns.length === 0) {
    lines.push('No significant friction patterns identified. ✅');
  } else {
    for (const pattern of frictionPatterns) {
      const severityEmoji = pattern.severity === 'high' ? '🔴' : pattern.severity === 'medium' ? '🟡' : '🟢';
      lines.push(`- ${severityEmoji} **${pattern.pattern}**: ${pattern.count} occurrences`);
    }
  }
  lines.push('');

  // Recommendations
  lines.push('## Recommendations');
  lines.push('');
  if (frictionPatterns.length === 0) {
    lines.push('No immediate action required. All metrics within acceptable ranges.');
  } else {
    for (const pattern of frictionPatterns) {
      if (pattern.severity === 'high') {
        lines.push(`- **${pattern.pattern}**: High priority - investigate and fix`);
      } else if (pattern.severity === 'medium') {
        lines.push(`- **${pattern.pattern}**: Medium priority - monitor and improve`);
      }
    }
  }
  lines.push('');

  return lines.join('\n');
}

/**
 * Main execution
 */
function main() {
  console.log('Reading telemetry files...');
  const data = readTelemetryFiles();

  if (data.length === 0) {
    console.log('No telemetry files found. Run persona tests first.');
    return;
  }

  console.log(`Found ${data.length} telemetry files`);

  const stats = aggregateStats(data);
  const frictionPatterns = identifyFrictionPatterns(data);

  const feedback = generateFeedbackMarkdown(stats, frictionPatterns);

  // Write to docs/testing/persona-feedback.md
  const feedbackPath = path.join(projectRoot, 'docs', 'testing', 'persona-feedback.md');
  const feedbackDir = path.dirname(feedbackPath);
  fs.mkdirSync(feedbackDir, { recursive: true });

  // Append to existing file (or create new)
  const existingContent = fs.existsSync(feedbackPath) ? fs.readFileSync(feedbackPath, 'utf-8') : '';
  const separator = existingContent ? '\n\n---\n\n' : '';
  fs.writeFileSync(feedbackPath, existingContent + separator + feedback);

  console.log(`Feedback summary written to ${feedbackPath}`);
  console.log(`\nTop friction patterns:`);
  frictionPatterns.forEach((p) => {
    console.log(`  - ${p.pattern}: ${p.count} (${p.severity})`);
  });
}

main();

