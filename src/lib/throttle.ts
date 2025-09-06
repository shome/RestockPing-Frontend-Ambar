interface ThrottleEntry {
  count: number;
  resetTime: number;
}

class RequestThrottler {
  private requests: Map<string, ThrottleEntry> = new Map();
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests: number = 3, windowMs: number = 60000) { // 3 requests per minute by default
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  /**
   * Check if a request is allowed for the given identifier (IP, user, etc.)
   * @param identifier - Unique identifier for the requester
   * @returns true if request is allowed, false if throttled
   */
  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const entry = this.requests.get(identifier);

    if (!entry) {
      // First request from this identifier
      this.requests.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs
      });
      return true;
    }

    // Check if the window has expired
    if (now > entry.resetTime) {
      // Reset the counter
      this.requests.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs
      });
      return true;
    }

    // Check if we've exceeded the limit
    if (entry.count >= this.maxRequests) {
      return false;
    }

    // Increment the counter
    entry.count++;
    this.requests.set(identifier, entry);
    return true;
  }

  /**
   * Get the remaining requests for an identifier
   * @param identifier - Unique identifier for the requester
   * @returns number of remaining requests in current window
   */
  getRemainingRequests(identifier: string): number {
    const entry = this.requests.get(identifier);
    if (!entry) {
      return this.maxRequests;
    }

    const now = Date.now();
    if (now > entry.resetTime) {
      return this.maxRequests;
    }

    return Math.max(0, this.maxRequests - entry.count);
  }

  /**
   * Get the time until the throttle resets for an identifier
   * @param identifier - Unique identifier for the requester
   * @returns milliseconds until reset, or 0 if no active throttle
   */
  getTimeUntilReset(identifier: string): number {
    const entry = this.requests.get(identifier);
    if (!entry) {
      return 0;
    }

    const now = Date.now();
    if (now > entry.resetTime) {
      return 0;
    }

    return entry.resetTime - now;
  }

  /**
   * Clear all throttling data (useful for testing or manual reset)
   */
  clear(): void {
    this.requests.clear();
  }

  /**
   * Clean up expired entries to prevent memory leaks
   */
  cleanup(): void {
    const now = Date.now();
    for (const [identifier, entry] of this.requests.entries()) {
      if (now > entry.resetTime) {
        this.requests.delete(identifier);
      }
    }
  }
}

// Create a singleton instance
export const requestThrottler = new RequestThrottler(6, 60000); // Allow 5 attempts, block 6th

// Clean up expired entries every 5 minutes
setInterval(() => {
  requestThrottler.cleanup();
}, 5 * 60 * 1000);

export default requestThrottler;
