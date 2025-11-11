#!/usr/bin/env node
/**
 * Test Logger Utility
 * 
 * Centralized logging for all test runs. Overwrites previous logs of the same type.
 * Ensures all test output is captured and accessible in artifacts/test-logs/
 * 
 * Usage:
 *   import { TestLogger } from './scripts/test-logger.mjs';
 *   const logger = new TestLogger('unit');
 *   logger.log('Test output');
 *   logger.close();
 */

import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..');
const LOGS_DIR = join(REPO_ROOT, 'artifacts', 'test-logs');

// Ensure logs directory exists
if (!existsSync(LOGS_DIR)) {
  mkdirSync(LOGS_DIR, { recursive: true });
}

/**
 * Test Logger class
 * Overwrites previous logs of the same type, timestamps all entries
 */
export class TestLogger {
  constructor(testType = 'test') {
    this.testType = testType;
    this.logBuffer = [];
    this.startTime = Date.now();
    
    // Create log file path (overwrites previous log of same type)
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    this.logFile = join(LOGS_DIR, `${testType}-${timestamp}.log`);
    
    // Write initial header
    this.log(`=== ${testType.toUpperCase()} TEST RUN ===`);
    this.log(`Started: ${new Date().toISOString()}`);
    this.log('---');
  }

  /**
   * Log a message (buffered until flush)
   */
  log(message) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}`;
    this.logBuffer.push(logEntry);
    console.log(message); // Also output to console
  }

  /**
   * Log error message
   */
  error(message) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ERROR: ${message}`;
    this.logBuffer.push(logEntry);
    console.error(`ERROR: ${message}`);
  }

  /**
   * Flush buffer to file (overwrites previous log)
   */
  flush() {
    const duration = Date.now() - this.startTime;
    this.logBuffer.push('---');
    this.logBuffer.push(`Completed: ${new Date().toISOString()}`);
    this.logBuffer.push(`Duration: ${duration}ms`);
    this.logBuffer.push('===');
    
    // Overwrite previous log file
    writeFileSync(this.logFile, this.logBuffer.join('\n') + '\n', 'utf8');
    this.logBuffer = [];
  }

  /**
   * Close logger and flush
   */
  close() {
    this.flush();
    return this.logFile;
  }

  /**
   * Get log file path
   */
  getLogPath() {
    return this.logFile;
  }
}

/**
 * Create a logger instance
 */
export function createLogger(testType) {
  return new TestLogger(testType);
}

/**
 * Log test results summary
 */
export function logTestSummary(testType, results) {
  const logger = new TestLogger(testType);
  
  logger.log(`Test Type: ${testType}`);
  logger.log(`Total Tests: ${results.total || 0}`);
  logger.log(`Passed: ${results.passed || 0}`);
  logger.log(`Failed: ${results.failed || 0}`);
  logger.log(`Skipped: ${results.skipped || 0}`);
  
  if (results.duration) {
    logger.log(`Duration: ${results.duration}ms`);
  }
  
  if (results.errors && results.errors.length > 0) {
    logger.log('---');
    logger.log('Errors:');
    results.errors.forEach((error, index) => {
      logger.error(`${index + 1}. ${error}`);
    });
  }
  
  const logPath = logger.close();
  return logPath;
}

