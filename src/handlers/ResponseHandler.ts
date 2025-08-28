/**
 * Response Handler for managing API responses and user feedback
 */
export class ResponseHandler {
  constructor() {
    console.log("📡 ResponseHandler initialized");
  }

  /**
   * Handle successful conversion response
   */
  handleSuccess(result: any): void {
    console.log("✅ Conversion successful:", {
      entries: result.entryCount,
      time: result.processingTime + "ms",
      warnings: result.warnings.length,
    });
  }

  /**
   * Handle conversion errors
   */
  handleError(error: Error): void {
    console.error("❌ Conversion error:", error);

    // Log error details for debugging
    if (error.stack) {
      console.error("Stack trace:", error.stack);
    }
  }

  /**
   * Handle validation errors
   */
  handleValidationError(message: string): void {
    console.warn("⚠️ Validation error:", message);
  }

  /**
   * Handle network errors
   */
  handleNetworkError(error: Error): void {
    console.error("🌐 Network error:", error);
  }

  /**
   * Handle file operation errors
   */
  handleFileError(operation: string, error: Error): void {
    console.error(`📁 File ${operation} error:`, error);
  }

  /**
   * Log performance metrics
   */
  logPerformance(operation: string, duration: number): void {
    console.log(`⏱️ Performance - ${operation}: ${duration}ms`);

    // Warn if operation is slow
    if (duration > 5000) {
      console.warn(
        `🐌 Slow operation detected: ${operation} took ${duration}ms`
      );
    }
  }

  /**
   * Handle warnings from conversion process
   */
  handleWarnings(warnings: string[]): void {
    if (warnings.length > 0) {
      console.warn("⚠️ Conversion warnings:", warnings);
    }
  }

  /**
   * Format error message for user display
   */
  formatErrorMessage(error: Error): string {
    // Remove technical details from user-facing messages
    let message = error.message;

    // Map common errors to user-friendly messages
    if (message.includes("Invalid XML")) {
      return "The selected file contains invalid XML. Please check the file format and try again.";
    }

    if (message.includes("No references found")) {
      return "No references were found in the selected file. Please verify the file contains reference data.";
    }

    if (message.includes("File too large")) {
      return "The selected file is too large. Please select a file smaller than 10MB.";
    }

    if (message.includes("Network")) {
      return "Network connection error. Please check your internet connection and try again.";
    }

    // Generic fallback
    return "An error occurred during conversion. Please try again or contact support if the problem persists.";
  }

  /**
   * Create structured error report
   */
  createErrorReport(error: Error, context: any = {}): any {
    return {
      timestamp: new Date().toISOString(),
      message: error.message,
      stack: error.stack,
      context,
      userAgent: navigator.userAgent,
      url: window.location.href,
      version: "1.0.0", // This would come from package.json in a real app
    };
  }
}
