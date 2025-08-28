/**
 * Enhanced Logger - TypeScript version with advanced features
 * Provides structured logging with listeners, filtering, and export capabilities
 */

export type LogLevel = "DEBUG" | "INFO" | "WARNING" | "ERROR" | "SUCCESS";

export interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  message: string;
  category?: string;
  data?: any;
}

export interface LogListener {
  (entry: LogEntry): void;
}

export interface LogFilter {
  level?: LogLevel[];
  category?: string[];
  timeRange?: {
    start: Date;
    end: Date;
  };
  searchTerm?: string;
}

export class Logger {
  private static instance: Logger;
  private logs: LogEntry[] = [];
  private listeners: LogListener[] = [];
  private maxLogs: number = 1000;
  private categories: Set<string> = new Set();

  private constructor() {
    console.log("📋 Logger initialized");
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  /**
   * Add a log entry
   */
  log(
    message: string,
    level: LogLevel = "INFO",
    category?: string,
    data?: any
  ): LogEntry {
    const entry: LogEntry = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      level,
      message,
      category,
      data,
    };

    this.logs.push(entry);

    // Track categories
    if (category) {
      this.categories.add(category);
    }

    // Keep only recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Notify listeners
    this.notifyListeners(entry);

    // Console output
    this.logToConsole(entry);

    return entry;
  }

  /**
   * Convenience methods for different log levels
   */
  debug(message: string, category?: string, data?: any): LogEntry {
    return this.log(message, "DEBUG", category, data);
  }

  info(message: string, category?: string, data?: any): LogEntry {
    return this.log(message, "INFO", category, data);
  }

  warning(message: string, category?: string, data?: any): LogEntry {
    return this.log(message, "WARNING", category, data);
  }

  error(message: string, category?: string, data?: any): LogEntry {
    return this.log(message, "ERROR", category, data);
  }

  success(message: string, category?: string, data?: any): LogEntry {
    return this.log(message, "SUCCESS", category, data);
  }

  /**
   * Add a log listener
   */
  addListener(listener: LogListener): void {
    this.listeners.push(listener);
  }

  /**
   * Remove a log listener
   */
  removeListener(listener: LogListener): void {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  /**
   * Get filtered logs
   */
  getLogs(filter?: LogFilter): LogEntry[] {
    let filtered = [...this.logs];

    if (filter) {
      if (filter.level && filter.level.length > 0) {
        filtered = filtered.filter((log) => filter.level!.includes(log.level));
      }

      if (filter.category && filter.category.length > 0) {
        filtered = filtered.filter(
          (log) => log.category && filter.category!.includes(log.category)
        );
      }

      if (filter.timeRange) {
        filtered = filtered.filter((log) => {
          const logTime = new Date(log.timestamp);
          return (
            logTime >= filter.timeRange!.start &&
            logTime <= filter.timeRange!.end
          );
        });
      }

      if (filter.searchTerm) {
        const searchLower = filter.searchTerm.toLowerCase();
        filtered = filtered.filter(
          (log) =>
            log.message.toLowerCase().includes(searchLower) ||
            (log.category && log.category.toLowerCase().includes(searchLower))
        );
      }
    }

    return filtered;
  }

  /**
   * Get all available categories
   */
  getCategories(): string[] {
    return Array.from(this.categories).sort();
  }

  /**
   * Clear all logs
   */
  clear(): void {
    this.logs = [];
    this.categories.clear();
    this.log("Log cleared", "INFO", "system");
  }

  /**
   * Export logs as JSON
   */
  exportAsJSON(filter?: LogFilter): string {
    const logs = this.getLogs(filter);
    return JSON.stringify(logs, null, 2);
  }

  /**
   * Export logs as CSV
   */
  exportAsCSV(filter?: LogFilter): string {
    const logs = this.getLogs(filter);
    const headers = ["Timestamp", "Level", "Category", "Message"];
    const csvRows = [headers.join(",")];

    logs.forEach((log) => {
      const row = [
        log.timestamp,
        log.level,
        log.category || "",
        `"${log.message.replace(/"/g, '""')}"`,
      ];
      csvRows.push(row.join(","));
    });

    return csvRows.join("\n");
  }

  /**
   * Get log statistics
   */
  getStats(): {
    total: number;
    byLevel: Record<LogLevel, number>;
    byCategory: Record<string, number>;
    timeRange: { start: string; end: string } | null;
  } {
    const stats = {
      total: this.logs.length,
      byLevel: {
        DEBUG: 0,
        INFO: 0,
        WARNING: 0,
        ERROR: 0,
        SUCCESS: 0,
      } as Record<LogLevel, number>,
      byCategory: {} as Record<string, number>,
      timeRange: null as { start: string; end: string } | null,
    };

    if (this.logs.length > 0) {
      stats.timeRange = {
        start: this.logs[0].timestamp,
        end: this.logs[this.logs.length - 1].timestamp,
      };

      this.logs.forEach((log) => {
        stats.byLevel[log.level]++;
        if (log.category) {
          stats.byCategory[log.category] =
            (stats.byCategory[log.category] || 0) + 1;
        }
      });
    }

    return stats;
  }

  /**
   * Set maximum number of logs to keep
   */
  setMaxLogs(max: number): void {
    this.maxLogs = max;
    if (this.logs.length > max) {
      this.logs = this.logs.slice(-max);
    }
  }

  /**
   * Notify all listeners of new log entry
   */
  private notifyListeners(entry: LogEntry): void {
    this.listeners.forEach((listener) => {
      try {
        listener(entry);
      } catch (error) {
        console.error("Log listener error:", error);
      }
    });
  }

  /**
   * Output log to console with appropriate method
   */
  private logToConsole(entry: LogEntry): void {
    const timestamp = new Date(entry.timestamp).toLocaleString();
    const prefix = entry.category ? `[${entry.category}]` : "";
    const message = `${prefix}[${timestamp}] ${entry.level}: ${entry.message}`;

    switch (entry.level) {
      case "DEBUG":
        console.debug(message, entry.data);
        break;
      case "ERROR":
        console.error(message, entry.data);
        break;
      case "WARNING":
        console.warn(message, entry.data);
        break;
      default:
        console.log(message, entry.data);
    }
  }
}
