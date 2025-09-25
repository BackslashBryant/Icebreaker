import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import { visit } from 'unist-util-visit'

export type TTicketStatus = 'Open' | 'In Progress' | 'Done'
export type TTicketPriority = 'Low' | 'Medium' | 'High'

export interface ITicketFrontmatter {
	id: string
	title: string
	status: TTicketStatus
	priority: TTicketPriority
	labels?: string[]
	assignees?: string[]
}

export interface ITicketFile {
	filePath: string
	frontmatter: ITicketFrontmatter
	summary: string
	acceptanceCriteria: { text: string; checked: boolean }[]
	notes: string
}

export function ticketsDirectory(): string {
	return path.join(process.cwd(), 'docs', 'tickets')
}

export function readTicketFilePaths(dir = ticketsDirectory()): string[] {
	try {
		return fs
			.readdirSync(dir, { withFileTypes: true })
			.filter((e) => e.isFile() && e.name.toLowerCase().endsWith('.md'))
			.map((e) => path.join(dir, e.name))
	} catch {
		return []
	}
}

export function parseTicket(filePath: string): ITicketFile | null {
	const raw = fs.readFileSync(filePath, 'utf8')
	const fm = matter(raw)
	const data = fm.data as Partial<ITicketFrontmatter>
	if (!data.id || !data.title || !data.status || !data.priority) return null

	const frontmatter: ITicketFrontmatter = {
		id: String(data.id),
		title: String(data.title),
		status: data.status as TTicketStatus,
		priority: data.priority as TTicketPriority,
		labels: Array.isArray(data.labels) ? (data.labels as string[]) : [],
		assignees: Array.isArray(data.assignees) ? (data.assignees as string[]) : [],
	}

	const summary = extractSection(fm.content, /^#\s+Summary$/i)
	const notes = extractSection(fm.content, /^##\s+Notes$/i)
	const acceptanceCriteria = parseAcceptanceCriteria(fm.content)

	return {
		filePath,
		frontmatter,
		summary,
		acceptanceCriteria,
		notes,
	}
}

export function extractSection(markdown: string, headingRegex: RegExp): string {
	const lines = markdown.split(/\r?\n/)
	const idx = lines.findIndex((l) => headingRegex.test(l.trim()))
	if (idx === -1) return ''
	const out: string[] = []
	for (let i = idx + 1; i < lines.length; i += 1) {
		const line = lines[i]
		if (/^#/.test(line.trim())) break
		out.push(line)
	}
	return out.join('\n').trim()
}

export function parseAcceptanceCriteria(markdown: string): { text: string; checked: boolean }[] {
	const tree = unified().use(remarkParse).use(remarkGfm).parse(markdown)
	const items: { text: string; checked: boolean }[] = []
	visit(tree, 'listItem', (node: any) => {
		if (typeof node.checked === 'boolean') {
			// Extract plain text from listItem
			let text = ''
			visit(node, 'text', (t: any) => {
				text += t.value
			})
			items.push({ text: text.trim(), checked: Boolean(node.checked) })
		}
	})
	return items
}

export function issueTitle(front: ITicketFrontmatter): string {
	return `[${front.id}] ${front.title}`
}

export function desiredLabels(front: ITicketFrontmatter): string[] {
	const base = new Set<string>()
	base.add('ticket')
	base.add(`priority:${front.priority.toLowerCase()}`)
	if (front.status === 'In Progress') base.add('status:in-progress')
	;(front.labels || []).forEach((l) => base.add(l))
	return Array.from(base).sort()
}

export function buildIssueBody(ticket: ITicketFile, repo?: { owner: string; repo: string }): string {
	const parts: string[] = []
	parts.push(`# ${ticket.frontmatter.title}`)
	parts.push('')
	parts.push(`Ticket ID: ${ticket.frontmatter.id}`)
	parts.push(`Status: ${ticket.frontmatter.status}`)
	parts.push(`Priority: ${ticket.frontmatter.priority}`)
	if (ticket.frontmatter.labels?.length) parts.push(`Labels: ${ticket.frontmatter.labels.join(', ')}`)
	if (ticket.frontmatter.assignees?.length) parts.push(`Assignees: ${ticket.frontmatter.assignees.join(', ')}`)
	parts.push('')
	if (ticket.summary) {
		parts.push('## Summary')
		parts.push(ticket.summary)
		parts.push('')
	}
	if (ticket.acceptanceCriteria.length) {
		parts.push('## Acceptance Criteria')
		for (const ac of ticket.acceptanceCriteria) {
			parts.push(`- [${ac.checked ? 'x' : ' '}] ${ac.text}`)
		}
		parts.push('')
	}
	if (ticket.notes) {
		parts.push('## Notes')
		parts.push(ticket.notes)
		parts.push('')
	}
	const rel = path.relative(process.cwd(), ticket.filePath).replace(/\\/g, '/')
	if (repo) {
		parts.push(`Source: https://github.com/${repo.owner}/${repo.repo}/blob/HEAD/${rel}`)
	}
	parts.push('---')
	parts.push('Synced from docs/tickets via scripts/sync-issues.ts')
	return parts.join('\n')
}


