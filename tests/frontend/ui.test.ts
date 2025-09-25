import { describe, it, expect } from 'vitest'
import { getFrontendHealth } from '../../frontend/main'

describe('Frontend Health', () => {
  it('should format a health message', () => {
    const h = getFrontendHealth()
    expect(h.ok).toBe(true)
    expect(h.service).toBe('frontend')
    expect(h.text).toContain('Frontend OK')
  })
})