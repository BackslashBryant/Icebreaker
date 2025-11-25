#!/usr/bin/env node
/**
 * Railway Environment Variable Setter
 * Uses Railway GraphQL API to set environment variables
 */

const token = process.env.RAILWAY_TOKEN || process.argv[2];
const key = process.argv[3];
const value = process.argv[4];

if (!token || !key || !value) {
  console.error('Usage: node tools/railway-set-env.mjs <token> <key> <value>');
  console.error('   or: RAILWAY_TOKEN=<token> node tools/railway-set-env.mjs <key> <value>');
  process.exit(1);
}

// Railway GraphQL API endpoint
const RAILWAY_API = 'https://backboard.railway.app/graphql/v1';

// GraphQL mutation to set variable
const mutation = `
  mutation SetVariable($input: VariableUpsertInput!) {
    variableUpsert(input: $input) {
      id
      key
      value
    }
  }
`;

async function setVariable() {
  try {
    // First, we need to get the project/service ID
    // For now, let's try a simpler approach - use Railway REST API if available
    // Or we need project/service ID from Railway dashboard
    
    console.log('⚠️  Railway API requires project/service ID');
    console.log('   Please use Railway Dashboard or complete Railway CLI login');
    console.log('\nAlternative: Use Railway Dashboard → Variables → Add');
    console.log(`   Key: ${key}`);
    console.log(`   Value: ${value}`);
    
    // TODO: Implement GraphQL API call once we have project/service ID
    // This requires:
    // 1. Get project ID from Railway dashboard
    // 2. Get service ID from Railway dashboard  
    // 3. Use GraphQL mutation with proper input
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

setVariable();

