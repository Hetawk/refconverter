/**
 * Progress Manager for handling batch operations and progress tracking
 * TypeScript version for future enhancements
 */

export interface ProgressCallback {
  (progress: number, message: string, isComplete: boolean): void;
}

export interface ProgressState {
  current: number;
  total: number;
  percentage: number;
  message: string;
  isActive: boolean;
  isCancelled: boolean;
}

export class ProgressManager {
  private callbacks: ProgressCallback[] = [];
  private state: ProgressState = {
    current: 0,
    total: 0,
    percentage: 0,
    message: "",
    isActive: false,
    isCancelled: false,
  };

  /**
   * Add a progress callback
   */
  addCallback(callback: ProgressCallback): void {
    this.callbacks.push(callback);
  }

  /**
   * Remove a progress callback
   */
  removeCallback(callback: ProgressCallback): void {
    const index = this.callbacks.indexOf(callback);
    if (index > -1) {
      this.callbacks.splice(index, 1);
    }
  }

  /**
   * Start a new progress operation
   */
  start(total: number, message: string = "Processing..."): void {
    this.state = {
      current: 0,
      total,
      percentage: 0,
      message,
      isActive: true,
      isCancelled: false,
    };
    this.notifyCallbacks();
  }

  /**
   * Update progress
   */
  update(current: number, message?: string): void {
    if (!this.state.isActive || this.state.isCancelled) return;

    this.state.current = Math.min(current, this.state.total);
    this.state.percentage =
      this.state.total > 0
        ? Math.round((this.state.current / this.state.total) * 100)
        : 0;

    if (message) {
      this.state.message = message;
    } else if (this.state.total > 0) {
      this.state.message = `Processing item ${this.state.current} of ${this.state.total}`;
    }

    this.notifyCallbacks();
  }

  /**
   * Increment progress by 1
   */
  increment(message?: string): void {
    this.update(this.state.current + 1, message);
  }

  /**
   * Complete the progress operation
   */
  complete(message: string = "Completed"): void {
    this.state.current = this.state.total;
    this.state.percentage = 100;
    this.state.message = message;
    this.state.isActive = false;
    this.notifyCallbacks();
  }

  /**
   * Cancel the progress operation
   */
  cancel(message: string = "Cancelled"): void {
    this.state.isCancelled = true;
    this.state.isActive = false;
    this.state.message = message;
    this.notifyCallbacks();
  }

  /**
   * Get current progress state
   */
  getState(): ProgressState {
    return { ...this.state };
  }

  /**
   * Check if operation is active
   */
  isActive(): boolean {
    return this.state.isActive;
  }

  /**
   * Check if operation was cancelled
   */
  isCancelled(): boolean {
    return this.state.isCancelled;
  }

  /**
   * Notify all callbacks of progress update
   */
  private notifyCallbacks(): void {
    const isComplete =
      this.state.current >= this.state.total && this.state.total > 0;
    this.callbacks.forEach((callback) => {
      try {
        callback(this.state.percentage, this.state.message, isComplete);
      } catch (error) {
        console.error("Progress callback error:", error);
      }
    });
  }

  /**
   * Reset progress manager
   */
  reset(): void {
    this.state = {
      current: 0,
      total: 0,
      percentage: 0,
      message: "",
      isActive: false,
      isCancelled: false,
    };
  }
}
