import { describe, it, expect } from 'vitest'
import { buildIssueBody, desiredLabels, issueTitle, parseTicket } from '../../scripts/lib/ticket-parser'
import fs from 'node:fs'
import path from 'node:path'

describe('ticket parser and mappings', () => {
	it('parses frontmatter, acceptance criteria, and builds labels/body', () => {
		const tmp = path.join(process.cwd(), 'docs', 'tickets', 'TKT-TEST.md')
		const md = `---\nid: TKT-999\ntitle: Example\nstatus: In Progress\npriority: High\nlabels: [web]\nassignees: [octocat]\n---\n\n# Summary\nHello world\n\n## Acceptance Criteria\n- [ ] A\n- [x] B\n`
		fs.writeFileSync(tmp, md, 'utf8')
		const t = parseTicket(tmp)
		fs.unlinkSync(tmp)
		expect(t).toBeTruthy()
		if (!t) return
		expect(issueTitle(t.frontmatter)).toBe('[TKT-999] Example')
		expect(desiredLabels(t.frontmatter)).toContain('ticket')
		expect(desiredLabels(t.frontmatter)).toContain('priority:high')
		expect(desiredLabels(t.frontmatter)).toContain('status:in-progress')
		const body = buildIssueBody(t)
		expect(body).toContain('## Acceptance Criteria')
		expect(body).toContain('- [ ] A')
		expect(body).toContain('- [x] B')
	})
})


