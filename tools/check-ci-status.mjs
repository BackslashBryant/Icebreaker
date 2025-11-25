#!/usr/bin/env node

/**
 * Check CI workflow run status for a branch
 * Uses GitHub REST API to check workflow runs
 */

import { getRepo, getGitHubToken, getApiBase } from './lib/github-api.mjs';

const [branch] = process.argv.slice(2);

if (!branch) {
  console.error('Usage: node tools/check-ci-status.mjs <branch-name>');
  process.exit(1);
}

const repo = getRepo();
const token = getGitHubToken();
const apiBase = getApiBase();

async function checkWorkflowRuns() {
  try {
    // Get workflow runs for the branch
    const response = await fetch(
      `${apiBase}/repos/${repo}/actions/runs?branch=${branch}&per_page=5`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`GitHub API error (${response.status}): ${error}`);
    }

    const data = await response.json();
    const runs = data.workflow_runs || [];

    if (runs.length === 0) {
      console.log(`No workflow runs found for branch: ${branch}`);
      return;
    }

    const latestRun = runs[0];
    console.log(`\nLatest workflow run for branch "${branch}":`);
    console.log(`  Run ID: ${latestRun.id}`);
    console.log(`  Status: ${latestRun.status}`);
    console.log(`  Conclusion: ${latestRun.conclusion || 'pending'}`);
    console.log(`  URL: ${latestRun.html_url}`);
    console.log(`  Created: ${new Date(latestRun.created_at).toLocaleString()}`);

    // Get jobs for this run
    const jobsResponse = await fetch(
      `${apiBase}/repos/${repo}/actions/runs/${latestRun.id}/jobs`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );

    if (jobsResponse.ok) {
      const jobsData = await jobsResponse.json();
      const jobs = jobsData.jobs || [];

      console.log(`\nJobs (${jobs.length}):`);
      for (const job of jobs) {
        const conclusion = job.conclusion || 'pending';
        const icon = conclusion === 'success' ? '✅' : conclusion === 'failure' ? '❌' : '⏳';
        console.log(`  ${icon} ${job.name}: ${job.status} (${conclusion})`);
      }
    }

    // Check specifically for health-mvp jobs
    const healthMvpJobs = runs
      .flatMap(run => {
        // We'd need to fetch jobs for each run, but for now just show the latest
        return [];
      })
      .filter(job => job.name.includes('health-mvp'));

    if (healthMvpJobs.length > 0) {
      console.log(`\nHealth-MVP Jobs:`);
      healthMvpJobs.forEach(job => {
        console.log(`  - ${job.name}: ${job.conclusion || job.status}`);
      });
    }

  } catch (error) {
    console.error('Error checking CI status:', error.message);
    if (error.message.includes('token')) {
      console.error('\nTry: gh auth login');
    }
    process.exit(1);
  }
}

checkWorkflowRuns();

