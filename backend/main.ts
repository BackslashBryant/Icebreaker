import fs from 'node:fs'
import path from 'node:path'

export type HealthStatus = {
  ok: boolean
  service: 'backend'
  version: string
  ts: string
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

export function getBackendHealth(): HealthStatus {
  return {
    ok: true,
    service: 'backend',
    version: readRootPackageVersion(),
    ts: new Date().toISOString(),
  }
}

// If you later add an HTTP server, return this JSON at GET /health