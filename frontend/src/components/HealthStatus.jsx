import { useState, useEffect } from 'react';

/**
 * HealthStatus Component
 *
 * Displays the health status from the backend API
 */
export function HealthStatus() {
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/health')
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setStatus(data.status);
        setError(null);
      })
      .catch((err) => {
        setError(err.message);
        setStatus('error');
      });
  }, []);

  return (
    <div>
      <h2>Health Status</h2>
      {error ? (
        <p>Error: {error}</p>
      ) : (
        <p>Status: {status}</p>
      )}
    </div>
  );
}
