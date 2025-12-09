// ===============================================
// SECURE ERROR HANDLER
// ===============================================

export enum ErrorType {
  // Public endpoint errors (generic messages)
  AUTHENTICATION_FAILED = 'AUTHENTICATION_FAILED',
  REGISTRATION_FAILED = 'REGISTRATION_FAILED',
  INVALID_INPUT = 'INVALID_INPUT',
  
  // Authenticated endpoint errors (specific messages)
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  OPERATION_FAILED = 'OPERATION_FAILED',
  
  // Internal errors (never expose details)
  DATABASE_ERROR = 'DATABASE_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}

export interface AppError {
  type: ErrorType;
  message: string;
  details?: any; // Only for authenticated users
  statusCode: number;
}

export class ErrorHandler {
  /**
   * Create safe error for public endpoints (login, register)
   * NEVER expose details that help attackers
   */
  static publicError(type: ErrorType, logMessage?: string): AppError {
    // Log internally for debugging
    if (logMessage) {
      console.error(`[SECURITY] ${type}:`, logMessage);
    }

    const messages: Record<string, string> = {
      [ErrorType.AUTHENTICATION_FAILED]: 'Invalid credentials',
      [ErrorType.REGISTRATION_FAILED]: 'Unable to complete registration',
      [ErrorType.INVALID_INPUT]: 'Invalid input provided',
    };

    return {
      type,
      message: messages[type] || 'Operation failed',
      statusCode: type === ErrorType.AUTHENTICATION_FAILED ? 401 : 400,
    };
  }

  /**
   * Create detailed error for authenticated endpoints
   * Users are verified, so we can be more specific
   */
  static authenticatedError(
    type: ErrorType,
    message: string,
    details?: any
  ): AppError {
    const statusCodes: Record<string, number> = {
      [ErrorType.RESOURCE_NOT_FOUND]: 404,
      [ErrorType.PERMISSION_DENIED]: 403,
      [ErrorType.VALIDATION_ERROR]: 400,
      [ErrorType.OPERATION_FAILED]: 500,
      [ErrorType.DATABASE_ERROR]: 500,
      [ErrorType.INTERNAL_ERROR]: 500,
    };

    return {
      type,
      message,
      details,
      statusCode: statusCodes[type] || 500,
    };
  }

  /**
   * Sanitize error for client response
   * Remove stack traces and sensitive data in production
   */
  static sanitizeError(error: any, isProduction: boolean): any {
    if (isProduction) {
      // In production, NEVER send stack traces or internal details
      return {
        success: false,
        error: {
          type: error.type || ErrorType.INTERNAL_ERROR,
          message: error.message || 'An error occurred',
        },
      };
    }

    // In development, include more details for debugging
    return {
      success: false,
      error: {
        type: error.type || ErrorType.INTERNAL_ERROR,
        message: error.message || 'An error occurred',
        details: error.details,
        stack: error.stack, // Only in development
      },
    };
  }

  /**
   * Check if error should be logged as security incident
   */
  static isSecurityIncident(error: any): boolean {
    const securityPatterns = [
      'SQL injection',
      'XSS',
      'CSRF',
      'rate limit',
      'brute force',
      'unauthorized access',
    ];

    const errorString = JSON.stringify(error).toLowerCase();
    return securityPatterns.some((pattern) =>
      errorString.includes(pattern.toLowerCase())
    );
  }

  /**
   * Log security incident (should integrate with monitoring service)
   */
  static logSecurityIncident(incident: any): void {
    console.error('[SECURITY INCIDENT]', {
      timestamp: new Date().toISOString(),
      incident,
      // In production, send to monitoring service (e.g., Sentry, DataDog)
    });
  }
}
