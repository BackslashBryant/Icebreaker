import http from 'http';

/**
 * Test Server Utilities
 * 
 * Provides reusable functions for creating and managing test servers
 * with dynamic port allocation to prevent port conflicts.
 */

/**
 * Creates an HTTP server on a dynamically allocated port
 * 
 * @param {Object} app - Express app or request handler
 * @param {Object} options - Optional configuration
 * @param {number} options.port - Specific port (default: 0 for dynamic allocation)
 * @returns {Promise<{server: http.Server, port: number, url: string}>}
 */
export async function createTestServer(app, options = {}) {
  const server = http.createServer(app);
  const port = options.port || 0; // 0 = let OS assign available port
  
  return new Promise((resolve, reject) => {
    server.listen(port, (err) => {
      if (err) {
        reject(err);
        return;
      }
      
      const actualPort = server.address().port;
      const url = `http://localhost:${actualPort}`;
      
      resolve({
        server,
        port: actualPort,
        url,
      });
    });
    
    // Handle errors during listen
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        reject(new Error(`Port ${port} is already in use`));
      } else {
        reject(err);
      }
    });
  });
}

/**
 * Closes a test server gracefully with error handling
 * 
 * @param {http.Server} server - The server to close
 * @returns {Promise<void>}
 */
export async function closeTestServer(server) {
  return new Promise((resolve, reject) => {
    if (!server) {
      resolve();
      return;
    }
    
    if (!server.listening) {
      resolve();
      return;
    }
    
    server.close((err) => {
      if (err) {
        // If server is already closed or closing, treat as success
        if (err.code === 'ERR_SERVER_NOT_RUNNING' || err.code === 'EADDRINUSE') {
          resolve();
        } else {
          reject(err);
        }
      } else {
        resolve();
      }
    });
    
    // Force close after timeout if graceful close fails
    setTimeout(() => {
      if (server.listening) {
        server.close(() => {
          resolve(); // Resolve anyway to prevent test hang
        });
      }
    }, 1000);
  });
}

/**
 * Creates a WebSocket-capable test server on a dynamically allocated port
 * 
 * @param {Object} app - Express app or request handler
 * @param {Object} options - Optional configuration
 * @returns {Promise<{server: http.Server, port: number, url: string, wsUrl: string}>}
 */
export async function createWebSocketTestServer(app, options = {}) {
  const result = await createTestServer(app, options);
  
  return {
    ...result,
    wsUrl: `ws://localhost:${result.port}`,
  };
}

