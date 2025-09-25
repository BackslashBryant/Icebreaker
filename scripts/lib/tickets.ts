/*
 High-level helpers for ticket parsing and mapping to GitHub issues.
*/
import fs from 'node:fs';
import path from 'node:path';

export type TTicketStatus = 'Open' | 'In Progress' | 'Done';
export type TTicketPriority = 'Low' | 'Medium' | 'High';

export interface ITicketFrontmatter {
  id: string;
  title: string;
  status: TTicketStatus;
  priority: TTicketPriority;
  labels?: string[];
  assignees?: string[];
}

export interface ITicketFile {
  filePath: string;
  frontmatter: ITicketFrontmatter;
  summary: string;
  acceptanceCriteria: string[];
  notes: string;
}

export function readTicketFiles(ticketsDir: string): string[] {
  try {
    return fs
      .readdirSync(ticketsDir, { withFileTypes: true })
      .filter((e) => e.isFile() && e.name.toLowerCase().endsWith('.md'))
      .map((e) => path.join(ticketsDir, e.name));
  } catch {
    return [];
  }
}

export function parseFrontmatter(content: string): ITicketFrontmatter | null {
  const lines = content.split(/\r?\n/);
  if (lines[0]?.trim() !== '---') return null;
  let i = 1;
  const fmLines: string[] = [];
  while (i < lines.length && lines[i].trim() !== '---') {
    fmLines.push(lines[i]);
    i += 1;
  }
  if (i >= lines.length) return null;

  const obj: Record<string, unknown> = {};
  for (const raw of fmLines) {
    const line = raw.replace(/\s+#.*$/, '').trim();
    if (!line) continue;
    const idx = line.indexOf(':');
    if (idx < 0) continue;
    const key = line.slice(0, idx).trim();
    let valueRaw = line.slice(idx + 1).trim();
    if (valueRaw.startsWith('[') && valueRaw.endsWith(']')) {
      const inside = valueRaw.slice(1, -1).trim();
      const arr = inside
        ? inside.split(',').map((s) => s.trim().replace(/^"|^'|"$|'$/g, '')).filter(Boolean)
        : [];
      obj[key] = arr;
    } else {
      obj[key] = valueRaw.replace(/^"|^'|"$|'$/g, '');
    }
  }

  const fm = obj as Partial<ITicketFrontmatter>;
  if (!fm.id || !fm.title || !fm.status || !fm.priority) return null;
  return {
    id: String(fm.id),
    title: String(fm.title),
    status: fm.status as TTicketStatus,
    priority: fm.priority as TTicketPriority,
    labels: (fm.labels as string[]) || [],
    assignees: (fm.assignees as string[]) || [],
  };
}

export function extractSection(content: string, heading: string): string[] {
  const lines = content.split(/\r?\n/);
  const idx = lines.findIndex((l) => l.trim().toLowerCase() === heading.toLowerCase());
  if (idx === -1) return [];
  const out: string[] = [];
  for (let i = idx + 1; i < lines.length; i += 1) {
    const line = lines[i];
    if (/^#/.test(line.trim())) break;
    out.push(line);
  }
  return out;
}

export function parseAcceptanceCriteria(content: string): string[] {
  const section = extractSection(content, '## Acceptance Criteria');
  return section
    .map((l) => l.trim())
    .filter((l) => /^- \[( |x|X)\]/.test(l));
}

export function parseSummary(content: string): string {
  const lines = extractSection(content, '# Summary');
  return lines.join('\n').trim();
}

export function parseNotes(content: string): string {
  const lines = extractSection(content, '## Notes');
  return lines.join('\n').trim();
}

export function parseTicketFile(filePath: string): ITicketFile | null {
  const content = fs.readFileSync(filePath, 'utf8');
  const frontmatter = parseFrontmatter(content);
  if (!frontmatter) return null;
  const acceptanceCriteria = parseAcceptanceCriteria(content);
  const summary = parseSummary(content);
  const notes = parseNotes(content);
  return { filePath, frontmatter, acceptanceCriteria, summary, notes };
}

export function desiredLabels(front: ITicketFrontmatter): string[] {
  const labels: string[] = [];
  labels.push('ticket');
  const prio = front.priority.toLowerCase();
  labels.push(`priority:${prio}`);
  if (front.status === 'In Progress') labels.push('status:in-progress');
  if (front.labels && front.labels.length) labels.push(...front.labels);
  return Array.from(new Set(labels)).sort();
}

export function issueTitleFor(front: ITicketFrontmatter): string {
  return `[${front.id}] ${front.title}`;
}

export function buildIssueBody(ticket: ITicketFile): string {
  const parts: string[] = [];
  parts.push(`# ${ticket.frontmatter.title}`);
  parts.push('');
  parts.push(`Ticket ID: ${ticket.frontmatter.id}`);
  parts.push(`Status: ${ticket.frontmatter.status}`);
  parts.push(`Priority: ${ticket.frontmatter.priority}`);
  if (ticket.frontmatter.labels?.length) parts.push(`Labels: ${ticket.frontmatter.labels.join(', ')}`);
  if (ticket.frontmatter.assignees?.length) parts.push(`Assignees: ${ticket.frontmatter.assignees.join(', ')}`);
  parts.push('');
  if (ticket.summary) {
    parts.push('## Summary');
    parts.push(ticket.summary);
    parts.push('');
  }
  if (ticket.acceptanceCriteria.length) {
    parts.push('## Acceptance Criteria');
    parts.push(...ticket.acceptanceCriteria);
    parts.push('');
  }
  if (ticket.notes) {
    parts.push('## Notes');
    parts.push(ticket.notes);
    parts.push('');
  }
  parts.push('---');
  parts.push('Synced from docs/tickets via scripts/sync-issues.ts');
  return parts.join('\n');
}

export function ticketsDirectory(): string {
  return path.join(process.cwd(), 'docs', 'tickets');
}


