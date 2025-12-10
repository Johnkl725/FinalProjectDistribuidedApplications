// ===============================================
// REQUEST QUEUE - CONCURRENCY CONTROL
// ===============================================

/**
 * RequestQueue - Controls concurrent database operations
 * Prevents pool exhaustion by limiting simultaneous requests
 * 
 * @principle Single Responsibility - Only manages request queuing
 * @pattern Queue Pattern with Semaphore-like behavior
 */
export class RequestQueue {
  private queue: Array<() => Promise<void>> = [];
  private running = 0;
  private readonly maxConcurrent: number;

  /**
   * @param maxConcurrent Maximum number of concurrent operations
   */
  constructor(maxConcurrent: number = 5) {
    this.maxConcurrent = maxConcurrent;
  }

  /**
   * Execute a function with concurrency control
   * @param fn Function to execute
   * @returns Promise resolving to function result
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // If under limit, execute immediately
    if (this.running < this.maxConcurrent) {
      return this.run(fn);
    }

    // Otherwise, queue and wait
    return new Promise<T>((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await this.run(fn);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  /**
   * Run function and manage concurrency counter
   */
  private async run<T>(fn: () => Promise<T>): Promise<T> {
    this.running++;
    try {
      return await fn();
    } finally {
      this.running--;
      this.processQueue();
    }
  }

  /**
   * Process next item in queue if available
   */
  private processQueue(): void {
    if (this.queue.length > 0 && this.running < this.maxConcurrent) {
      const next = this.queue.shift();
      if (next) {
        next();
      }
    }
  }

  /**
   * Get current queue status
   */
  getStatus(): { running: number; queued: number } {
    return {
      running: this.running,
      queued: this.queue.length,
    };
  }
}

// Singleton instance - shared across all services
// Max 10 concurrent DB operations to prevent pool exhaustion
export const requestQueue = new RequestQueue(10);
