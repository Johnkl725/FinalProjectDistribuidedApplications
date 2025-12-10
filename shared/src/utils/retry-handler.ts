// ===============================================
// RETRY HANDLER - RESILIENCE PATTERN
// ===============================================

/**
 * RetryOptions configuration interface
 */
export interface RetryOptions {
  maxAttempts?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  backoffMultiplier?: number;
  retryableErrors?: string[];
}

/**
 * RetryHandler - Implements retry logic with exponential backoff
 * 
 * @principle Open/Closed - Open for extension, closed for modification
 * @pattern Strategy Pattern - Configurable retry strategy
 */
export class RetryHandler {
  private readonly options: Required<RetryOptions>;

  constructor(options: RetryOptions = {}) {
    this.options = {
      maxAttempts: options.maxAttempts ?? 3,
      initialDelayMs: options.initialDelayMs ?? 1000,
      maxDelayMs: options.maxDelayMs ?? 10000,
      backoffMultiplier: options.backoffMultiplier ?? 2,
      retryableErrors: options.retryableErrors ?? [
        'ECONNREFUSED',
        'ETIMEDOUT',
        'ENOTFOUND',
        'connection terminated',
        'Connection terminated',
        'sorry, too many clients',
      ],
    };
  }

  /**
   * Execute function with retry logic
   * @param fn Function to execute
   * @param context Context name for logging
   * @returns Promise resolving to function result
   */
  async execute<T>(
    fn: () => Promise<T>,
    context: string = 'operation'
  ): Promise<T> {
    let lastError: Error | undefined;
    
    for (let attempt = 1; attempt <= this.options.maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        
        // Check if error is retryable
        if (!this.isRetryable(error) || attempt === this.options.maxAttempts) {
          throw error;
        }

        // Calculate delay with exponential backoff
        const delay = this.calculateDelay(attempt);
        
        console.warn(
          `[RetryHandler] ${context} failed (attempt ${attempt}/${this.options.maxAttempts}). ` +
          `Retrying in ${delay}ms... Error: ${this.getErrorMessage(error)}`
        );

        await this.sleep(delay);
      }
    }

    throw lastError;
  }

  /**
   * Check if error is retryable
   */
  private isRetryable(error: unknown): boolean {
    const message = this.getErrorMessage(error);
    return this.options.retryableErrors.some(
      (retryableError) => message.includes(retryableError)
    );
  }

  /**
   * Calculate delay with exponential backoff
   */
  private calculateDelay(attempt: number): number {
    const delay = this.options.initialDelayMs * 
                  Math.pow(this.options.backoffMultiplier, attempt - 1);
    return Math.min(delay, this.options.maxDelayMs);
  }

  /**
   * Extract error message safely
   */
  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === 'string') {
      return error;
    }
    return String(error);
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Default retry handler instance
export const defaultRetryHandler = new RetryHandler({
  maxAttempts: 3,
  initialDelayMs: 1000,
  maxDelayMs: 5000,
});
