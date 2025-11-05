import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { HealthStatus } from '../src/components/HealthStatus.jsx';

/**
 * Health Status Component Unit Test
 *
 * MVP DoD: Front-end renders the health status with passing tests
 *
 * This test verifies:
 * - Component renders and displays health status from API
 * - Component handles API response correctly
 * - Component shows appropriate loading/error states (if implemented)
 */
describe('HealthStatus Component', () => {
  beforeEach(() => {
    // Mock fetch globally for tests
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render health status from API', async () => {
    // Mock successful API response
    const mockFetch = vi.mocked(global.fetch);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: 'ok' }),
    } as Response);

    render(<HealthStatus />);

    await waitFor(() => {
      expect(screen.getByText(/ok/i)).toBeInTheDocument();
    });
  });

  it('should fetch health status from /api/health endpoint', async () => {
    const mockFetch = vi.mocked(global.fetch);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: 'ok' }),
    } as Response);

    render(<HealthStatus />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/health')
      );
    });
  });
});
