/**
 * Request Cancellation Utility
 * Manages AbortControllers to cancel previous requests when navigating fast
 */

class RequestManager {
  constructor() {
    this.controllers = new Map();
  }

  /**
   * Create or get abort controller for a specific request type
   * @param {string} key - Unique key for this request type
   * @returns {AbortController}
   */
  getController(key) {
    // Cancel previous request if exists
    if (this.controllers.has(key)) {
      const oldController = this.controllers.get(key);
      oldController.abort();
      console.log(`🚫 Cancelled previous request: ${key}`);
    }

    // Create new controller
    const controller = new AbortController();
    this.controllers.set(key, controller);

    return controller;
  }

  /**
   * Get signal for axios config
   * @param {string} key - Unique key for this request type
   * @returns {AbortSignal}
   */
  getSignal(key) {
    return this.getController(key).signal;
  }

  /**
   * Cancel specific request
   * @param {string} key - Key of the request to cancel
   */
  cancel(key) {
    const controller = this.controllers.get(key);
    if (controller) {
      controller.abort();
      this.controllers.delete(key);
      console.log(`🚫 Request cancelled: ${key}`);
    }
  }

  /**
   * Cancel all pending requests
   */
  cancelAll() {
    for (const [key, controller] of this.controllers.entries()) {
      controller.abort();
      console.log(`🚫 Request cancelled: ${key}`);
    }
    this.controllers.clear();
  }

  /**
   * Clean up completed request
   * @param {string} key - Key of the completed request
   */
  cleanup(key) {
    this.controllers.delete(key);
  }
}

// Singleton instance
const requestManager = new RequestManager();

export default requestManager;
