#!/usr/bin/env -S node --loader tsx
import fs from 'node:fs'
import path from 'node:path'
import { Octokit } from '@octokit/rest'
import { parseTicket, readTicketFilePaths, ticketsDirectory } from './lib/ticket-parser'

type RepoRef = { owner: string; repo: string }

function parseRepoArg(argv: string[]): RepoRef | null {
	const idx = argv.indexOf('--repo')
	if (idx >= 0 && argv[idx + 1]) {
		const [owner, repo] = argv[idx + 1].split('/')
		if (owner && repo) return { owner, repo }
	}
	return null
}

function repoFromGitRemote(): RepoRef | null {
	try {
		const url = require('child_process').execSync('git remote get-url origin', { encoding: 'utf8' }).trim()
		const m = url.match(/github\.com[:\/]([^\/]+)\/([^\.]+)(?:\.git)?$/i)
		if (m) return { owner: m[1], repo: m[2] }
	} catch {}
	return null
}

async function main() {
	const token = process.env.GITHUB_TOKEN
	const repo = parseRepoArg(process.argv) ?? repoFromGitRemote()
	if (!repo) {
		console.error('Unable to resolve repo. Pass --repo <owner/name> or set git remote origin.')
		process.exit(1)
	}

	const octokit = token ? new Octokit({ auth: token }) : new Octokit()

	const files = readTicketFilePaths(ticketsDirectory())
	const tickets = files
		.map((f) => parseTicket(f))
		.filter((t): t is NonNullable<typeof t> => !!t)

	let table = '# Ticket Plan\n\n| ID | Title | Status | Issue |\n|----|-------|--------|-------|\n'
	for (const t of tickets) {
		let issueCell = ''
		try {
			if (token) {
				const q = `repo:${repo.owner}/${repo.repo} in:title "[${t.frontmatter.id}]"`
				const res = await octokit.search.issuesAndPullRequests({ q, per_page: 1 })
				const item = res.data.items[0]
				if (item) issueCell = `[#${item.number}](https://github.com/${repo.owner}/${repo.repo}/issues/${item.number})`
			}
		} catch {}
		table += `| ${t.frontmatter.id} | ${t.frontmatter.title} | ${t.frontmatter.status} | ${issueCell} |\n`
	}

	const planPath = path.join(process.cwd(), 'docs', 'tickets', 'TICKET_PLAN.md')
	fs.writeFileSync(planPath, table, 'utf8')
	console.log('Updated docs/tickets/TICKET_PLAN.md')
}

main().catch((e) => {
	console.error(e)
	process.exit(1)
})


