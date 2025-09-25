import fs from 'node:fs'
import path from 'node:path'

export type FrontendHealth = {
  ok: boolean
  service: 'frontend'
  version: string
  ts: string
  text: string
}

function readRootPackageVersion(): string {
  try {
    const pkgPath = path.join(process.cwd(), 'package.json')
    const raw = fs.readFileSync(pkgPath, 'utf8')
    const pkg = JSON.parse(raw) as { version?: string }
    return pkg.version ?? '0.0.0'
  } catch {
    return '0.0.0'
  }
}

export function getFrontendHealth(): FrontendHealth {
  const version = readRootPackageVersion()
  const ts = new Date().toISOString()
  return {
    ok: true,
    service: 'frontend',
    version,
    ts,
    text: `Frontend OK – v${version} @ ${ts}`,
  }
}

// A real app could render this to a /health page