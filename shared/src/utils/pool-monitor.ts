/**
 * Pool Monitor - Monitors and reports database connection pool status
 * 
 * This utility helps identify connection leaks and pool exhaustion issues
 * by periodically logging pool statistics and warning about potential problems.
 */

import { getDatabase } from '../database/connection';

export class PoolMonitor {
  private intervalId: NodeJS.Timeout | null = null;
  private readonly intervalMs: number;
  private readonly warningThreshold: number;

  constructor(intervalMs: number = 30000, warningThreshold: number = 0.8) {
    this.intervalMs = intervalMs;
    this.warningThreshold = warningThreshold; // Warn when pool is 80% full
  }

  /**
   * Start monitoring the connection pool
   */
  public start(): void {
    if (this.intervalId) {
      console.log('⚠️  Pool monitor already running');
      return;
    }

    console.log(`🔍 Starting pool monitor (interval: ${this.intervalMs}ms)`);

    this.intervalId = setInterval(() => {
      this.checkPoolStatus();
    }, this.intervalMs);
  }

  /**
   * Stop monitoring the connection pool
   */
  public stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('🛑 Pool monitor stopped');
    }
  }

  /**
   * Check current pool status and log warnings if needed
   */
  private checkPoolStatus(): void {
    const db = getDatabase();
    const status = db.getPoolStatus();

    const poolUtilization = status.total > 0 ? status.total / this.getMaxConnections() : 0;
    const activeConnections = status.total - status.idle;

    console.log(`
📊 Pool Status:
   Total: ${status.total}
   Active: ${activeConnections}
   Idle: ${status.idle}
   Waiting: ${status.waiting}
   Utilization: ${(poolUtilization * 100).toFixed(1)}%
    `);

    // Warn if pool is near capacity
    if (poolUtilization >= this.warningThreshold) {
      console.warn(`
⚠️  WARNING: Pool utilization at ${(poolUtilization * 100).toFixed(1)}%
   Consider investigating potential connection leaks or increasing pool size.
      `);
    }

    // Warn if there are waiting requests
    if (status.waiting > 0) {
      console.warn(`
⚠️  WARNING: ${status.waiting} requests waiting for connections
   Pool may be exhausted. Check for long-running queries or connection leaks.
      `);
    }

    // Critical alert if all connections are in use and requests are waiting
    if (status.idle === 0 && status.waiting > 0) {
      console.error(`
🚨 CRITICAL: Pool exhausted! All connections in use, ${status.waiting} waiting
   This may cause 503 errors. Immediate investigation required.
      `);
    }
  }

  /**
   * Get max connections based on environment
   */
  private getMaxConnections(): number {
    return process.env.NODE_ENV === 'production' ? 1 : 5;
  }

  /**
   * Force cleanup of idle connections (delegates to DatabaseConnection)
   */
  public async forceCleanup(): Promise<void> {
    const db = getDatabase();
    await db.cleanupIdleConnections();
  }
}

// Export singleton instance
export const poolMonitor = new PoolMonitor();
