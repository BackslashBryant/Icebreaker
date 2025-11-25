#!/usr/bin/env node
/**
 * UptimeRobot Configuration Script
 * 
 * Configures UptimeRobot monitors via API for Issue #22 monitoring setup.
 * 
 * Usage:
 *   node tools/uptimerobot-config.mjs --api-key <key> --action <create|get|update>
 * 
 * Environment Variables:
 *   UPTIMEROBOT_API_KEY - Main API key (for create/update operations)
 *   UPTIMEROBOT_MONITOR_KEY - Monitor-specific key (for get operations)
 */

import https from 'https';
import { URL } from 'url';

const API_BASE = 'https://api.uptimerobot.com/v2';

/**
 * Make API request to UptimeRobot
 */
async function apiRequest(endpoint, params) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${API_BASE}/${endpoint}`);
    const data = new URLSearchParams(params).toString();

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(data),
      },
    };

    const req = https.request(url, options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          if (parsed.stat === 'ok') {
            resolve(parsed);
          } else {
            reject(new Error(`API Error: ${parsed.message || parsed.error?.message || 'Unknown error'}`));
          }
        } catch (e) {
          reject(new Error(`Parse Error: ${e.message}\nResponse: ${body}`));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

/**
 * Get monitor details
 */
async function getMonitor(apiKey) {
  console.log('📊 Fetching monitor details...');
  const result = await apiRequest('getMonitors', {
    api_key: apiKey,
    format: 'json',
    logs: 0,
  });

  if (result.monitors && result.monitors.length > 0) {
    const monitor = result.monitors[0];
    console.log(`✅ Monitor found: ${monitor.friendly_name}`);
    console.log(`   ID: ${monitor.id}`);
    console.log(`   URL: ${monitor.url}`);
    console.log(`   Status: ${monitor.status === 2 ? 'Up' : monitor.status === 9 ? 'Down' : 'Paused'}`);
    console.log(`   Interval: ${monitor.interval} seconds`);
    return monitor;
  } else {
    console.log('⚠️  No monitors found');
    return null;
  }
}

/**
 * Create a new monitor
 */
async function createMonitor(apiKey, config) {
  console.log('🔧 Creating monitor...');
  
  const params = {
    api_key: apiKey,
    format: 'json',
    type: config.type || 1, // 1 = HTTP(s)
    friendly_name: config.friendlyName || 'Icebreaker Backend Health',
    url: config.url || 'https://airy-fascination-production.up.railway.app/api/health',
    interval: config.interval || 300, // 5 minutes
    alert_contacts: config.alertContacts || '', // Will use default alert contact
  };

  // Add optional parameters
  if (config.keyword) params.keyword_value = config.keyword;
  if (config.port) params.port = config.port;
  if (config.subtype) params.sub_type = config.subtype;

  const result = await apiRequest('newMonitor', params);
  
  if (result.monitor) {
    console.log(`✅ Monitor created successfully!`);
    console.log(`   ID: ${result.monitor.id}`);
    console.log(`   Status: ${result.monitor.status}`);
    console.log(`\n📝 Monitor Key: ${result.monitor.id}-${result.monitor.api_key}`);
    console.log(`   Save this key for future reference!`);
    return result.monitor;
  } else {
    throw new Error('Monitor creation failed - no monitor returned');
  }
}

/**
 * Get alert contacts
 */
async function getAlertContacts(apiKey) {
  console.log('📧 Fetching alert contacts...');
  const result = await apiRequest('getAlertContacts', {
    api_key: apiKey,
    format: 'json',
  });

  if (result.alert_contacts && result.alert_contacts.length > 0) {
    console.log(`✅ Found ${result.alert_contacts.length} alert contact(s):`);
    result.alert_contacts.forEach(contact => {
      console.log(`   ID: ${contact.id}, Type: ${contact.type}, Value: ${contact.value || contact.friendly_name}`);
    });
    return result.alert_contacts;
  } else {
    console.log('⚠️  No alert contacts found');
    return [];
  }
}

/**
 * Update existing monitor
 */
async function updateMonitor(apiKey, monitorId, config) {
  console.log(`🔧 Updating monitor ${monitorId}...`);
  
  const params = {
    api_key: apiKey,
    format: 'json',
    id: monitorId,
  };

  if (config.friendlyName) params.friendly_name = config.friendlyName;
  if (config.url) params.url = config.url;
  if (config.interval) params.interval = config.interval;
  if (config.alertContacts) {
    // Format: alert_contacts should be comma-separated IDs like "1234567_0_0-1234567_0_1"
    // Format: {alertContactID}_{threshold}_{recurrence}
    // For default: just use alert contact ID with _0_0 (threshold 0, recurrence 0)
    params.alert_contacts = config.alertContacts;
  }

  const result = await apiRequest('editMonitor', params);
  
  if (result.monitor) {
    console.log(`✅ Monitor updated successfully!`);
    return result.monitor;
  } else {
    throw new Error('Monitor update failed');
  }
}

/**
 * Configure alerts for a monitor
 */
async function configureAlerts(apiKey, monitorId) {
  console.log(`🔔 Configuring alerts for monitor ${monitorId}...`);
  
  // First, get alert contacts
  const contacts = await getAlertContacts(apiKey);
  if (contacts.length === 0) {
    throw new Error('No alert contacts found. Please create an alert contact in UptimeRobot dashboard first.');
  }

  // Use first email contact (or first contact if no email)
  const emailContact = contacts.find(c => c.type === 2) || contacts[0];
  if (!emailContact) {
    throw new Error('No email alert contact found');
  }

  // Format alert contacts: {id}_0_0 (threshold 0 = always alert, recurrence 0 = no recurrence)
  // For 3 consecutive failures: {id}_3_0
  const alertContacts = `${emailContact.id}_3_0-${emailContact.id}_0_0`;

  console.log(`   Using alert contact: ${emailContact.id} (${emailContact.value || emailContact.friendly_name})`);
  console.log(`   Alert format: 3 consecutive failures + always on recovery`);

  const result = await updateMonitor(apiKey, monitorId, {
    alertContacts: alertContacts,
  });

  console.log(`✅ Alerts configured successfully!`);
  console.log(`   Monitor will alert after 3 consecutive failures (15 minutes)`);
  console.log(`   Monitor will alert when service recovers`);
  
  return result;
}

/**
 * Main CLI handler
 */
async function main() {
  const args = process.argv.slice(2);
  const apiKey = process.env.UPTIMEROBOT_API_KEY || args.find(arg => arg.startsWith('--api-key='))?.split('=')[1];
  const monitorKey = process.env.UPTIMEROBOT_MONITOR_KEY || args.find(arg => arg.startsWith('--monitor-key='))?.split('=')[1];
  const action = args.find(arg => arg.startsWith('--action='))?.split('=')[1] || 'get';

  if (!apiKey && !monitorKey) {
    console.error('❌ Error: API key or monitor key required');
    console.error('\nUsage:');
    console.error('  node tools/uptimerobot-config.mjs --action=<create|get|update> --api-key=<key>');
    console.error('  node tools/uptimerobot-config.mjs --action=get --monitor-key=<key>');
    console.error('\nOr set environment variables:');
    console.error('  UPTIMEROBOT_API_KEY=<key> node tools/uptimerobot-config.mjs');
    console.error('  UPTIMEROBOT_MONITOR_KEY=<key> node tools/uptimerobot-config.mjs');
    process.exit(1);
  }

  const keyToUse = monitorKey || apiKey;

  try {
    switch (action) {
      case 'get':
        await getMonitor(keyToUse);
        break;

      case 'create':
        if (!apiKey) {
          console.error('❌ Error: API key required for create action');
          process.exit(1);
        }
        await createMonitor(apiKey, {
          friendlyName: 'Icebreaker Backend Health',
          url: 'https://airy-fascination-production.up.railway.app/api/health',
          interval: 300, // 5 minutes
        });
        break;

      case 'update':
        if (!apiKey) {
          console.error('❌ Error: API key required for update action');
          process.exit(1);
        }
        const monitorId = args.find(arg => arg.startsWith('--monitor-id='))?.split('=')[1];
        if (!monitorId) {
          console.error('❌ Error: --monitor-id required for update action');
          process.exit(1);
        }
        await updateMonitor(apiKey, monitorId, {
          // Add update config here if needed
        });
        break;

      case 'alerts':
        if (!apiKey) {
          console.error('❌ Error: API key required for alerts action');
          process.exit(1);
        }
        const alertMonitorId = args.find(arg => arg.startsWith('--monitor-id='))?.split('=')[1] || '801829620';
        await configureAlerts(apiKey, alertMonitorId);
        break;

      case 'contacts':
        if (!apiKey) {
          console.error('❌ Error: API key required for contacts action');
          process.exit(1);
        }
        await getAlertContacts(apiKey);
        break;

      default:
        console.error(`❌ Error: Unknown action "${action}"`);
        console.error('Valid actions: create, get, update, alerts, contacts');
        process.exit(1);
    }
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
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

export { getMonitor, createMonitor, updateMonitor, getAlertContacts, configureAlerts };

