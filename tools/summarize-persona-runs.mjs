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

/**
 * @typedef {Object} TelemetryData
 * @property {string} persona
 * @property {string} sessionId
 * @property {string} timestamp
 * @property {Object} timings
 * @property {number} [timings.bootMs]
 * @property {number} [timings.onboardingMs]
 * @property {Record<number, number>} [timings.stepTimes]
 * @property {Object} interactions
 * @property {number} interactions.stepsRetried
 * @property {number} interactions.backButtonClicks
 * @property {number} interactions.errorBannersEncountered
 * @property {Object} accessibility
 * @property {number} [accessibility.a11yViolations]
 * @property {boolean} accessibility.focusOrderCorrect
 * @property {Object} accessibility.visibleAffordances
 * @property {boolean} accessibility.visibleAffordances.panicButton
 * @property {boolean} accessibility.visibleAffordances.visibilityToggle
 * @property {string[]} errors
 * @property {Record<string, any>} [metadata]
 */

/**
 * @typedef {Object} AggregatedStats
 * @property {string} persona
 * @property {number} runCount
 * @property {number} avgBootTime
 * @property {number} avgOnboardingTime
 * @property {number} totalRetries
 * @property {number} totalErrors
 * @property {number} a11yIssues
 * @property {number} affordanceIssues
 */

/**
 * @typedef {Object} FrictionPattern
 * @property {string} pattern
 * @property {number} count
 * @property {'low' | 'medium' | 'high'} severity
 */

/**
 * @typedef {Object} ActionableInsight
 * @property {string} title
 * @property {string} description
 * @property {'critical' | 'high' | 'medium' | 'low'} priority
 * @property {number} impactScore
 * @property {number} affectedUsers
 * @property {string[]} affectedPersonas
 * @property {string[]} recommendations
 * @property {string[]} [codeReferences]
 * @property {string} [category]
 */

/**
 * Read all telemetry files from artifacts/persona-runs/
 * @param {Date|null} sinceDate - Optional: Only include files with timestamp >= sinceDate
 * @param {Date|null} untilDate - Optional: Only include files with timestamp <= untilDate
 * @returns {TelemetryData[]}
 */
function readTelemetryFiles(sinceDate = null, untilDate = null) {
  const runsDir = path.join(projectRoot, 'artifacts', 'persona-runs');
  
  if (!fs.existsSync(runsDir)) {
    return [];
  }

  const files = fs.readdirSync(runsDir).filter((f) => f.endsWith('.json'));
  const data = [];

  for (const file of files) {
    try {
      const content = fs.readFileSync(path.join(runsDir, file), 'utf-8');
      const parsed = JSON.parse(content);
      
      // Apply date filtering if specified
      if (sinceDate || untilDate) {
        if (!parsed.timestamp) {
          // Skip files without timestamp (shouldn't happen, but handle gracefully)
          console.warn(`Warning: File ${file} missing timestamp field, skipping`);
          continue;
        }
        
        const fileTimestamp = new Date(parsed.timestamp);
        
        // Check if file is within date range
        if (sinceDate && fileTimestamp < sinceDate) {
          continue; // File is before sinceDate, skip it
        }
        if (untilDate && fileTimestamp > untilDate) {
          continue; // File is after untilDate, skip it
        }
      }
      
      data.push(parsed);
    } catch (error) {
      console.error(`Error reading ${file}:`, error);
    }
  }

  return data;
}

/**
 * Aggregate stats by persona
 * @param {TelemetryData[]} data
 * @returns {Map<string, AggregatedStats>}
 */
function aggregateStats(data) {
  const stats = new Map();

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

    const stat = stats.get(persona);
    if (!stat) continue;
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
 * @param {TelemetryData[]} data
 * @returns {FrictionPattern[]}
 */
function identifyFrictionPatterns(data) {
  const patterns = new Map();

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
  const frictionPatterns = Array.from(patterns.entries()).map(([pattern, count]) => {
    let severity = 'low';
    if (count >= 10) severity = 'high';
    else if (count >= 5) severity = 'medium';

    return { pattern, count, severity };
  });

  // Sort by count descending
  frictionPatterns.sort((a, b) => b.count - a.count);

  return frictionPatterns.slice(0, 5); // Top 5
}

/**
 * Generate actionable insights from friction patterns and telemetry data
 * @param {FrictionPattern[]} frictionPatterns
 * @param {TelemetryData[]} data
 * @param {Map<string, AggregatedStats>} stats
 * @returns {ActionableInsight[]}
 */
function generateActionableInsights(frictionPatterns, data, stats) {
  const insights = [];
  const totalRuns = Array.from(stats.values()).reduce((sum, s) => sum + s.runCount, 0);

  // Insight mapping: pattern -> actionable insight
  const insightMap = {
    'missing-panic-button': {
      title: 'Panic Button Not Visible During Tests',
      description: 'Panic button affordance not detected in majority of test runs, potentially impacting anxious users who need quick exit option.',
      category: 'accessibility',
      recommendations: [
        'Verify panic button is rendered on Radar page with correct data-testid="panic-fab"',
        'Ensure panic button is visible after onboarding completes',
        'Check CSS visibility/display properties - may be hidden by default',
        'Add telemetry check to verify panic button visibility in test helpers',
        'Consider adding panic button to Profile page as well for consistency'
      ],
      codeReferences: [
        'tests/utils/telemetry.ts:checkPanicButtonVisible()',
        'frontend/src/components/Radar.tsx (verify panic button rendering)',
        'tests/e2e/personas/*.spec.ts (verify panic button checks)'
      ]
    },
    'missing-visibility-toggle': {
      title: 'Visibility Toggle Not Detected',
      description: 'Visibility toggle affordance not found in most test runs, affecting privacy-conscious users who need control over their visibility.',
      category: 'privacy',
      recommendations: [
        'Verify visibility toggle is rendered on Profile page with correct selector',
        'Check if toggle is conditionally rendered (may only show when user is visible)',
        'Ensure data-testid="visibility-toggle" is present on toggle element',
        'Update test helpers to check Profile page, not Radar page',
        'Consider adding visibility toggle to Radar page for easier access'
      ],
      codeReferences: [
        'tests/utils/telemetry.ts:checkVisibilityToggleVisible()',
        'frontend/src/components/Profile.tsx (verify toggle rendering)',
        'tests/e2e/personas/*.spec.ts (verify toggle checks navigate to Profile)'
      ]
    },
    'error-banners': {
      title: 'Error Banners Appearing Frequently',
      description: 'Error banners detected in majority of test runs, indicating potential API errors, validation issues, or network problems.',
      category: 'reliability',
      recommendations: [
        'Review error banner triggers - identify most common error types',
        'Check API error handling and user-facing error messages',
        'Verify network error handling (timeouts, connection failures)',
        'Review form validation error display logic',
        'Consider improving error messages to be more user-friendly',
        'Add error telemetry to identify specific error patterns'
      ],
      codeReferences: [
        'tests/utils/telemetry.ts:countErrorBanners()',
        'frontend/src/components/ErrorBanner.tsx',
        'backend/src/routes/*.ts (API error handling)'
      ]
    },
    'slow-boot': {
      title: 'Slow Application Boot Time',
      description: 'Application boot time exceeds 3 seconds in multiple test runs, impacting first impression and user experience.',
      category: 'performance',
      recommendations: [
        'Optimize initial bundle size (code splitting, lazy loading)',
        'Review initial API calls - may be blocking render',
        'Check WebSocket connection timing - may delay boot',
        'Consider adding loading states to improve perceived performance',
        'Profile boot sequence to identify bottlenecks'
      ],
      codeReferences: [
        'frontend/src/app.tsx (boot sequence)',
        'frontend/src/utils/websocket.ts (connection timing)',
        'tests/utils/test-helpers.ts:waitForBootSequence()'
      ]
    },
    'slow-onboarding': {
      title: 'Onboarding Takes Too Long',
      description: 'Onboarding completion time exceeds 30 seconds, potentially causing user drop-off.',
      category: 'conversion',
      recommendations: [
        'Review onboarding flow - reduce number of steps if possible',
        'Optimize API calls during onboarding (batch requests)',
        'Add progress indicators to show completion status',
        'Consider making location step optional (already skippable)',
        'Review form validation timing - may be blocking submission'
      ],
      codeReferences: [
        'frontend/src/pages/Onboarding.tsx',
        'backend/src/routes/onboarding.ts',
        'tests/utils/test-helpers.ts:completeOnboarding()'
      ]
    },
    'step-retries': {
      title: 'Users Retrying Steps Frequently',
      description: 'Step retries detected, indicating confusion or unclear instructions in onboarding flow.',
      category: 'usability',
      recommendations: [
        'Review onboarding copy for clarity',
        'Add better error messages when steps fail',
        'Improve form validation feedback',
        'Consider adding "back" button functionality',
        'Test onboarding flow with real users for clarity'
      ],
      codeReferences: [
        'frontend/src/pages/Onboarding.tsx (step navigation)',
        'frontend/src/components/OnboardingStep.tsx'
      ]
    },
    'a11y-violations': {
      title: 'Accessibility Violations Detected',
      description: 'WCAG AA violations found in accessibility scans, impacting users with disabilities.',
      category: 'accessibility',
      recommendations: [
        'Review axe-core violation reports for specific issues',
        'Fix color contrast issues (ensure WCAG AA compliance)',
        'Add missing ARIA labels to interactive elements',
        'Verify keyboard navigation works for all interactive elements',
        'Test with screen readers to verify accessibility'
      ],
      codeReferences: [
        'tests/e2e/personas/*.spec.ts (accessibility tests)',
        'frontend/src/components/*.tsx (ARIA labels)'
      ]
    },
    'runtime-errors': {
      title: 'Runtime Errors During Tests',
      description: 'JavaScript runtime errors detected, indicating potential bugs or unhandled exceptions.',
      category: 'reliability',
      recommendations: [
        'Review error logs to identify specific error types',
        'Add error boundaries to catch React errors',
        'Improve error handling in async operations',
        'Add comprehensive error logging',
        'Fix identified bugs causing runtime errors'
      ],
      codeReferences: [
        'frontend/src/utils/error-handling.ts',
        'frontend/src/components/ErrorBoundary.tsx'
      ]
    }
  };

  // Generate insights from friction patterns
  for (const pattern of frictionPatterns) {
    const insightTemplate = insightMap[pattern.pattern];
    if (!insightTemplate) continue;

    // Calculate impact score (0-100)
    const frequencyScore = Math.min((pattern.count / totalRuns) * 100, 100);
    const severityScore = pattern.severity === 'high' ? 100 : pattern.severity === 'medium' ? 60 : 30;
    const impactScore = Math.round((frequencyScore * 0.6 + severityScore * 0.4));

    // Determine priority based on impact
    let priority = 'low';
    if (impactScore >= 70) priority = 'critical';
    else if (impactScore >= 50) priority = 'high';
    else if (impactScore >= 30) priority = 'medium';

    // Find affected personas
    const affectedPersonas = [];
    for (const run of data) {
      if (run.persona && !affectedPersonas.includes(run.persona)) {
        // Check if this run has the pattern
        let hasPattern = false;
        if (pattern.pattern === 'missing-panic-button' && !run.accessibility?.visibleAffordances?.panicButton) {
          hasPattern = true;
        } else if (pattern.pattern === 'missing-visibility-toggle' && !run.accessibility?.visibleAffordances?.visibilityToggle) {
          hasPattern = true;
        } else if (pattern.pattern === 'error-banners' && (run.interactions?.errorBannersEncountered || 0) > 0) {
          hasPattern = true;
        } else if (pattern.pattern === 'slow-boot' && run.timings?.bootMs && run.timings.bootMs > 3000) {
          hasPattern = true;
        } else if (pattern.pattern === 'slow-onboarding' && run.timings?.onboardingMs && run.timings.onboardingMs > 30000) {
          hasPattern = true;
        } else if (pattern.pattern === 'step-retries' && (run.interactions?.stepsRetried || 0) > 0) {
          hasPattern = true;
        } else if (pattern.pattern === 'a11y-violations' && (run.accessibility?.a11yViolations || 0) > 0) {
          hasPattern = true;
        } else if (pattern.pattern === 'runtime-errors' && (run.errors?.length || 0) > 0) {
          hasPattern = true;
        }

        if (hasPattern) {
          affectedPersonas.push(run.persona);
        }
      }
    }

    insights.push({
      title: insightTemplate.title,
      description: insightTemplate.description,
      priority: priority,
      impactScore: impactScore,
      affectedUsers: pattern.count,
      affectedPersonas: affectedPersonas.slice(0, 5), // Top 5 affected personas
      recommendations: insightTemplate.recommendations,
      codeReferences: insightTemplate.codeReferences || [],
      category: insightTemplate.category || 'general'
    });
  }

  // Sort by impact score descending
  insights.sort((a, b) => b.impactScore - a.impactScore);

  return insights;
}

/**
 * Generate feedback markdown with actionable insights
 * @param {Map<string, AggregatedStats>} stats
 * @param {FrictionPattern[]} frictionPatterns
 * @param {ActionableInsight[]} insights
 * @returns {string}
 */
function generateFeedbackMarkdown(stats, frictionPatterns, insights) {
  const lines = [];

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

  // Executive Summary
  lines.push('## Executive Summary');
  lines.push('');
  const criticalInsights = insights.filter(i => i.priority === 'critical');
  const highInsights = insights.filter(i => i.priority === 'high');
  
  if (criticalInsights.length > 0) {
    lines.push(`⚠️ **${criticalInsights.length} critical issue(s)** requiring immediate attention`);
  }
  if (highInsights.length > 0) {
    lines.push(`🔴 **${highInsights.length} high-priority issue(s)** should be addressed soon`);
  }
  if (criticalInsights.length === 0 && highInsights.length === 0) {
    lines.push('✅ No critical or high-priority issues identified');
  }
  lines.push('');

  // Actionable Insights
  lines.push('## Actionable Insights');
  lines.push('');
  if (insights.length === 0) {
    lines.push('No actionable insights generated. All metrics within acceptable ranges.');
  } else {
    for (const insight of insights) {
      const priorityEmoji = insight.priority === 'critical' ? '🔴' : 
                           insight.priority === 'high' ? '🟠' : 
                           insight.priority === 'medium' ? '🟡' : '🟢';
      
      lines.push(`### ${priorityEmoji} ${insight.title} (Impact: ${insight.impactScore}/100)`);
      lines.push('');
      lines.push(`**Priority**: ${insight.priority.toUpperCase()} | **Category**: ${insight.category} | **Affected Users**: ${insight.affectedUsers}`);
      lines.push('');
      lines.push(`**Description**: ${insight.description}`);
      lines.push('');
      
      if (insight.affectedPersonas.length > 0) {
        lines.push(`**Affected Personas**: ${insight.affectedPersonas.join(', ')}`);
        lines.push('');
      }
      
      lines.push('**Recommendations**:');
      for (const rec of insight.recommendations) {
        lines.push(`- ${rec}`);
      }
      lines.push('');
      
      if (insight.codeReferences.length > 0) {
        lines.push('**Code References**:');
        for (const ref of insight.codeReferences) {
          lines.push(`- \`${ref}\``);
        }
        lines.push('');
      }
    }
  }
  lines.push('');

  // Legacy Recommendations (for backward compatibility)
  lines.push('## Recommendations (Legacy Format)');
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
 * Parse CLI arguments for date filtering
 * @returns {{sinceDate: Date|null, untilDate: Date|null}}
 */
function parseDateFilters() {
  const args = process.argv.slice(2);
  let sinceDate = null;
  let untilDate = null;

  // Parse --since <YYYY-MM-DD>
  const sinceIndex = args.indexOf('--since');
  if (sinceIndex !== -1 && args[sinceIndex + 1]) {
    const sinceValue = args[sinceIndex + 1];
    const parsed = new Date(sinceValue + 'T00:00:00.000Z');
    if (!isNaN(parsed.getTime())) {
      sinceDate = parsed;
    } else {
      console.error(`Warning: Invalid date format for --since: ${sinceValue}. Expected YYYY-MM-DD. Ignoring.`);
    }
  }

  // Parse --window <N>d (e.g., --window 7d)
  const windowIndex = args.indexOf('--window');
  if (windowIndex !== -1 && args[windowIndex + 1]) {
    const windowValue = args[windowIndex + 1];
    const match = windowValue.match(/^(\d+)d$/i);
    if (match) {
      const days = parseInt(match[1], 10);
      const now = new Date();
      sinceDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      // If --since was also specified, --window takes precedence
      if (sinceIndex !== -1) {
        console.log(`Note: --window overrides --since. Using last ${days} days.`);
      }
    } else {
      console.error(`Warning: Invalid window format: ${windowValue}. Expected <N>d (e.g., 7d). Ignoring.`);
    }
  }

  return { sinceDate, untilDate };
}

/**
 * Main execution
 */
function main() {
  // Parse date filters from CLI arguments
  const { sinceDate, untilDate } = parseDateFilters();
  
  // Log filtering info
  if (sinceDate || untilDate) {
    console.log('Reading telemetry files with date filtering...');
    if (sinceDate) {
      console.log(`  Filtering: Since ${sinceDate.toISOString().split('T')[0]}`);
    }
    if (untilDate) {
      console.log(`  Filtering: Until ${untilDate.toISOString().split('T')[0]}`);
    }
  } else {
    console.log('Reading telemetry files...');
  }
  
  const data = readTelemetryFiles(sinceDate, untilDate);

  if (data.length === 0) {
    if (sinceDate || untilDate) {
      console.log('No telemetry files found in specified date range. Try without date filters or run persona tests.');
    } else {
      console.log('No telemetry files found. Run persona tests first.');
    }
    return;
  }

  console.log(`Found ${data.length} telemetry files${sinceDate || untilDate ? ' (filtered)' : ''}`);

  const stats = aggregateStats(data);
  const frictionPatterns = identifyFrictionPatterns(data);
  const insights = generateActionableInsights(frictionPatterns, data, stats);

  const feedback = generateFeedbackMarkdown(stats, frictionPatterns, insights);

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
  console.log(`\nActionable insights generated: ${insights.length}`);
  insights.forEach((i) => {
    const priorityEmoji = i.priority === 'critical' ? '🔴' : i.priority === 'high' ? '🟠' : i.priority === 'medium' ? '🟡' : '🟢';
    console.log(`  ${priorityEmoji} ${i.title} (Impact: ${i.impactScore}/100, Priority: ${i.priority})`);
  });
}

main();

