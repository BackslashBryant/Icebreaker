import { describe, it, expect } from 'vitest'
import { getBackendHealth } from '../../backend/main'

describe('Backend Health', () => {
  it('should return ok health payload', () => {
    const h = getBackendHealth()
    expect(h.ok).toBe(true)
    expect(h.service).toBe('backend')
    expect(typeof h.version).toBe('string')
    expect(typeof h.ts).toBe('string')
  })
})