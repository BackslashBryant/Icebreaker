#!/usr/bin/env node
/**
 * Sentry Alert Rules Configuration Script
 * 
 * Configures Sentry alert rules via API for Issue #22 monitoring setup.
 * 
 * Usage:
 *   node tools/sentry-alerts-config.mjs --auth-token <token> --org <org> --project <project> --action <create|list>
 * 
 * Environment Variables:
 *   SENTRY_AUTH_TOKEN - Sentry auth token (from Settings → Auth Tokens)
 *   SENTRY_ORG - Sentry organization slug
 *   SENTRY_PROJECT - Sentry project slug
 */

import https from 'https';
import { URL } from 'url';

const API_BASE = 'https://sentry.io/api/0';

/**
 * Make API request to Sentry
 */
async function apiRequest(endpoint, method = 'GET', body = null, authToken) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${API_BASE}${endpoint}`);
    
    const options = {
      method,
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    };

    if (body) {
      options.headers['Content-Length'] = Buffer.byteLength(JSON.stringify(body));
    }

    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            const parsed = JSON.parse(data);
            resolve(parsed);
          } else {
            const error = JSON.parse(data);
            reject(new Error(`API Error (${res.statusCode}): ${error.detail || error.message || data}`));
          }
        } catch (e) {
          reject(new Error(`Parse Error: ${e.message}\nResponse: ${data}`));
        }
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

/**
 * List existing alert rules
 */
async function listAlertRules(authToken, org, project) {
  console.log(`📋 Listing alert rules for ${org}/${project}...`);
  
  try {
    const rules = await apiRequest(`/projects/${org}/${project}/alert-rules/`, 'GET', null, authToken);
    
    if (rules && rules.length > 0) {
      console.log(`✅ Found ${rules.length} alert rule(s):`);
      rules.forEach((rule, index) => {
        console.log(`\n${index + 1}. ${rule.name}`);
        console.log(`   ID: ${rule.id}`);
        console.log(`   Conditions: ${rule.conditions?.length || 0}`);
        console.log(`   Actions: ${rule.actions?.length || 0}`);
        console.log(`   Status: ${rule.status === 'active' ? '✅ Active' : '⏸️ ' + rule.status}`);
      });
      return rules;
    } else {
      console.log('⚠️  No alert rules found');
      return [];
    }
  } catch (error) {
    if (error.message.includes('404')) {
      console.log('⚠️  Alert rules endpoint not found (may need different API version)');
      console.log('   Note: Alert rules may need to be configured via dashboard');
      return [];
    }
    throw error;
  }
}

/**
 * Create an alert rule
 */
async function createAlertRule(authToken, org, project, ruleConfig) {
  console.log(`🔧 Creating alert rule: ${ruleConfig.name}...`);
  
  const rule = {
    name: ruleConfig.name,
    environment: ruleConfig.environment || null, // null = all environments
    conditions: ruleConfig.conditions || [],
    actions: ruleConfig.actions || [],
    frequency: ruleConfig.frequency || 60, // Check every 60 seconds
    projects: [project],
  };

  try {
    const result = await apiRequest(
      `/projects/${org}/${project}/alert-rules/`,
      'POST',
      rule,
      authToken
    );
    
    console.log(`✅ Alert rule created successfully!`);
    console.log(`   ID: ${result.id}`);
    console.log(`   Name: ${result.name}`);
    return result;
  } catch (error) {
    if (error.message.includes('404')) {
      throw new Error('Alert rules API endpoint not available. Please configure alerts via Sentry dashboard: https://backslashbryant.sentry.io');
    }
    throw error;
  }
}

/**
 * Create error rate alert rule
 * 
 * Note: Sentry alert rules API format is complex. This is a template that may need adjustment
 * based on actual Sentry API response. If API fails, use dashboard configuration.
 */
async function createErrorRateAlert(authToken, org, project, threshold, severity = 'warning') {
  const name = `Error Rate ${severity === 'critical' ? 'Critical' : 'Warning'} (>${threshold}/min)`;
  
  // Sentry alert rule format (v0 API)
  // Actual format may vary - check Sentry API docs for latest schema
  const rule = {
    name,
    environment: null, // null = all environments
    conditions: [
      {
        id: 'sentry.rules.conditions.event_frequency.EventFrequencyCondition',
        interval: '1m',
        value: threshold,
      },
    ],
    actions: [
      {
        id: 'sentry.rules.actions.notify_event_service.NotifyEventServiceAction',
        service: 'mail',
      },
    ],
    frequency: 60, // Check every 60 seconds
    projects: [project],
  };

  try {
    return await createAlertRule(authToken, org, project, rule);
  } catch (error) {
    console.error(`⚠️  Failed to create ${name} via API: ${error.message}`);
    console.error('   Please configure this alert manually in Sentry dashboard');
    throw error;
  }
}

/**
 * Create performance alert rule
 * 
 * Note: Performance alerts use transaction data. Format may differ from error alerts.
 */
async function createPerformanceAlert(authToken, org, project, threshold, severity = 'warning') {
  const name = `Performance ${severity === 'critical' ? 'Critical' : 'Warning'} (P95 >${threshold}ms)`;
  
  // Performance alert rule format
  const rule = {
    name,
    environment: null,
    conditions: [
      {
        id: 'sentry.rules.conditions.tagged_event.TaggedEventCondition',
        key: 'transaction.duration',
        match: 'gte',
        value: threshold,
      },
    ],
    actions: [
      {
        id: 'sentry.rules.actions.notify_event_service.NotifyEventServiceAction',
        service: 'mail',
      },
    ],
    frequency: 60,
    projects: [project],
  };

  try {
    return await createAlertRule(authToken, org, project, rule);
  } catch (error) {
    console.error(`⚠️  Failed to create ${name} via API: ${error.message}`);
    console.error('   Please configure this alert manually in Sentry dashboard');
    throw error;
  }
}

/**
 * Configure all recommended alert rules
 */
async function configureAllAlerts(authToken, org, project) {
  console.log(`🔔 Configuring all alert rules for ${org}/${project}...\n`);

  const rules = [];

  try {
    // Error rate alerts
    console.log('Creating error rate alerts...');
    rules.push(await createErrorRateAlert(authToken, org, project, 5, 'warning'));
    rules.push(await createErrorRateAlert(authToken, org, project, 10, 'critical'));
    
    // Performance alerts
    console.log('\nCreating performance alerts...');
    rules.push(await createPerformanceAlert(authToken, org, project, 1000, 'warning'));
    rules.push(await createPerformanceAlert(authToken, org, project, 2000, 'critical'));

    console.log(`\n✅ Successfully created ${rules.length} alert rules!`);
    return rules;
  } catch (error) {
    console.error(`\n❌ Error configuring alerts: ${error.message}`);
    console.error('\nNote: Sentry alert rules API may require dashboard configuration.');
    console.error('Please configure alerts manually at: https://backslashbryant.sentry.io');
    throw error;
  }
}

/**
 * Main CLI handler
 */
async function main() {
  const args = process.argv.slice(2);
  const authToken = process.env.SENTRY_AUTH_TOKEN || args.find(arg => arg.startsWith('--auth-token='))?.split('=')[1];
  const org = process.env.SENTRY_ORG || args.find(arg => arg.startsWith('--org='))?.split('=')[1] || 'backslashbryant';
  const project = process.env.SENTRY_PROJECT || args.find(arg => arg.startsWith('--project='))?.split('=')[1] || 'icebreaker';
  const action = args.find(arg => arg.startsWith('--action='))?.split('=')[1] || 'list';

  if (!authToken && action !== 'list') {
    console.error('❌ Error: Auth token required');
    console.error('\nUsage:');
    console.error('  node tools/sentry-alerts-config.mjs --action=<list|create|configure> --auth-token=<token>');
    console.error('  node tools/sentry-alerts-config.mjs --action=<list|create|configure> --auth-token=<token> --org=<org> --project=<project>');
    console.error('\nOr set environment variables:');
    console.error('  SENTRY_AUTH_TOKEN=<token> SENTRY_ORG=<org> SENTRY_PROJECT=<project> node tools/sentry-alerts-config.mjs');
    console.error('\nGet auth token from: https://backslashbryant.sentry.io/settings/auth-tokens/');
    process.exit(1);
  }

  try {
    switch (action) {
      case 'list':
        if (!authToken) {
          console.error('❌ Error: Auth token required for list action');
          process.exit(1);
        }
        await listAlertRules(authToken, org, project);
        break;

      case 'create':
        const ruleName = args.find(arg => arg.startsWith('--name='))?.split('=')[1];
        if (!ruleName) {
          console.error('❌ Error: --name required for create action');
          process.exit(1);
        }
        await createAlertRule(authToken, org, project, { name: ruleName });
        break;

      case 'configure':
        await configureAllAlerts(authToken, org, project);
        break;

      default:
        console.error(`❌ Error: Unknown action "${action}"`);
        console.error('Valid actions: list, create, configure');
        process.exit(1);
    }
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    if (error.message.includes('404') || error.message.includes('not available')) {
      console.error('\n💡 Tip: Sentry alert rules may need to be configured via dashboard.');
      console.error('   Dashboard: https://backslashbryant.sentry.io');
      console.error('   See: docs/monitoring/ALERTING-SETUP.md for manual setup');
    }
    process.exit(1);
  }
}

// Run if called directly
const isMainModule = import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}` || 
                     process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'));

if (isMainModule || !process.env.NODE_ENV) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

export { listAlertRules, createAlertRule, configureAllAlerts };

