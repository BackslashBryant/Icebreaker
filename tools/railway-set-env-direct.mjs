#!/usr/bin/env node
/**
 * Railway Environment Variable Setter (Direct API)
 * Uses Railway GraphQL API directly when CLI fails
 */

const token = process.env.RAILWAY_TOKEN || process.env.RAILWAY_API_TOKEN || process.argv[2];
const key = process.argv[3] || 'HEALTH_CHECK_TEST_FAIL';
const value = process.argv[4] || 'true';

if (!token) {
  console.error('❌ Error: Railway token required');
  console.error('\nUsage:');
  console.error('  RAILWAY_TOKEN=<token> node tools/railway-set-env-direct.mjs <key> <value>');
  console.error('  node tools/railway-set-env-direct.mjs <token> <key> <value>');
  process.exit(1);
}

// Railway GraphQL API endpoint
const RAILWAY_GRAPHQL_API = 'https://backboard.railway.app/graphql/v1';

// GraphQL mutation to set variable
const mutation = `
  mutation VariableUpsert($input: VariableUpsertInput!) {
    variableUpsert(input: $input) {
      id
      key
      value
    }
  }
`;

async function setVariable() {
  try {
    console.log('⚠️  Railway GraphQL API requires:');
    console.log('   1. Project ID');
    console.log('   2. Service ID (or environment ID)');
    console.log('   3. Valid authentication token');
    console.log('\nAlternative: Use Railway Dashboard');
    console.log('   1. Go to Railway Dashboard → airy-fascination service');
    console.log('   2. Variables tab → Add/Edit HEALTH_CHECK_TEST_FAIL=true');
    console.log('   3. Deployments tab → Redeploy');
    console.log('\nOr complete Railway CLI browser login:');
    console.log('   railway login  # Complete browser auth');
    console.log('   railway link   # Select project');
    console.log('   railway variables --set "HEALTH_CHECK_TEST_FAIL=true"');
    console.log('   railway redeploy');
    
    // TODO: Implement GraphQL API call once we have project/service IDs
    // Requires Railway project ID and service ID from dashboard
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

setVariable();

