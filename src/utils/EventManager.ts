/**
 * Event Manager - Centralized event handling following DRY principles
 * Manages all app-wide events and provides a clean interface for event handling
 */
export type EventCallback = (...args: any[]) => void;

export interface EventSubscription {
  unsubscribe: () => void;
}

export class EventManager {
  private static instance: EventManager;
  private events: Map<string, EventCallback[]> = new Map();
  private onceEvents: Map<string, EventCallback[]> = new Map();

  private constructor() {
    console.log("🎯 EventManager initialized");
  }

  static getInstance(): EventManager {
    if (!EventManager.instance) {
      EventManager.instance = new EventManager();
    }
    return EventManager.instance;
  }

  /**
   * Subscribe to an event
   */
  on(eventName: string, callback: EventCallback): EventSubscription {
    if (!this.events.has(eventName)) {
      this.events.set(eventName, []);
    }

    this.events.get(eventName)!.push(callback);

    return {
      unsubscribe: () => this.off(eventName, callback),
    };
  }

  /**
   * Subscribe to an event that fires only once
   */
  once(eventName: string, callback: EventCallback): EventSubscription {
    if (!this.onceEvents.has(eventName)) {
      this.onceEvents.set(eventName, []);
    }

    this.onceEvents.get(eventName)!.push(callback);

    return {
      unsubscribe: () => this.offOnce(eventName, callback),
    };
  }

  /**
   * Unsubscribe from an event
   */
  off(eventName: string, callback: EventCallback): void {
    const callbacks = this.events.get(eventName);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * Unsubscribe from a once event
   */
  private offOnce(eventName: string, callback: EventCallback): void {
    const callbacks = this.onceEvents.get(eventName);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * Emit an event
   */
  emit(eventName: string, ...args: any[]): void {
    // Handle regular events
    const callbacks = this.events.get(eventName);
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(...args);
        } catch (error) {
          console.error(`Error in event callback for '${eventName}':`, error);
        }
      });
    }

    // Handle once events
    const onceCallbacks = this.onceEvents.get(eventName);
    if (onceCallbacks) {
      const callbacksCopy = [...onceCallbacks];
      this.onceEvents.delete(eventName); // Clear once events after firing

      callbacksCopy.forEach((callback) => {
        try {
          callback(...args);
        } catch (error) {
          console.error(
            `Error in once event callback for '${eventName}':`,
            error
          );
        }
      });
    }
  }

  /**
   * Remove all listeners for an event
   */
  removeAllListeners(eventName: string): void {
    this.events.delete(eventName);
    this.onceEvents.delete(eventName);
  }

  /**
   * Remove all listeners for all events
   */
  clear(): void {
    this.events.clear();
    this.onceEvents.clear();
  }

  /**
   * Get list of events with listeners
   */
  getEvents(): string[] {
    const regularEvents = Array.from(this.events.keys());
    const onceEvents = Array.from(this.onceEvents.keys());
    return [...new Set([...regularEvents, ...onceEvents])];
  }

  /**
   * Get listener count for an event
   */
  getListenerCount(eventName: string): number {
    const regularCount = this.events.get(eventName)?.length || 0;
    const onceCount = this.onceEvents.get(eventName)?.length || 0;
    return regularCount + onceCount;
  }

  /**
   * Check if an event has listeners
   */
  hasListeners(eventName: string): boolean {
    return this.getListenerCount(eventName) > 0;
  }
}

// Pre-defined event constants for type safety
export const APP_EVENTS = {
  // File events
  FILE_SELECTED: "file:selected",
  FILE_VALIDATED: "file:validated",
  FILE_READ: "file:read",

  // Conversion events
  CONVERSION_START: "conversion:start",
  CONVERSION_PROGRESS: "conversion:progress",
  CONVERSION_SUCCESS: "conversion:success",
  CONVERSION_ERROR: "conversion:error",
  CONVERSION_COMPLETE: "conversion:complete",

  // UI events
  THEME_CHANGED: "ui:theme-changed",
  MOBILE_MENU_TOGGLED: "ui:mobile-menu-toggled",
  LOADING_STATE_CHANGED: "ui:loading-state-changed",

  // Save events
  SAVE_TO_FILE: "save:file",
  SAVE_TO_CLIPBOARD: "save:clipboard",
  SAVE_TO_CLOUD: "save:cloud",

  // Error events
  ERROR_OCCURRED: "error:occurred",
  WARNING_OCCURRED: "warning:occurred",

  // App lifecycle
  APP_INITIALIZED: "app:initialized",
  APP_READY: "app:ready",
  APP_SHUTDOWN: "app:shutdown",
} as const;

// Type-safe event emitter
export class TypedEventManager {
  private eventManager: EventManager;

  constructor() {
    this.eventManager = EventManager.getInstance();
  }

  static getInstance(): TypedEventManager {
    return new TypedEventManager();
  }

  emitFileSelected(file: File): void {
    this.eventManager.emit(APP_EVENTS.FILE_SELECTED, file);
  }

  emitConversionStart(): void {
    this.eventManager.emit(APP_EVENTS.CONVERSION_START);
  }

  emitConversionSuccess(result: any): void {
    this.eventManager.emit(APP_EVENTS.CONVERSION_SUCCESS, result);
  }

  emitConversionError(error: Error): void {
    this.eventManager.emit(APP_EVENTS.CONVERSION_ERROR, error);
  }

  emitThemeChanged(isDark: boolean): void {
    this.eventManager.emit(APP_EVENTS.THEME_CHANGED, isDark);
  }

  emitError(error: Error, context?: any): void {
    this.eventManager.emit(APP_EVENTS.ERROR_OCCURRED, error, context);
  }

  emitWarning(message: string, context?: any): void {
    this.eventManager.emit(APP_EVENTS.WARNING_OCCURRED, message, context);
  }

  emitLoadingStateChanged(isLoading: boolean): void {
    this.eventManager.emit(APP_EVENTS.LOADING_STATE_CHANGED, isLoading);
  }

  // File events
  onFileSelected(callback: (file: File) => void): EventSubscription {
    return this.eventManager.on(APP_EVENTS.FILE_SELECTED, callback);
  }

  // Conversion events
  onConversionStart(callback: () => void): EventSubscription {
    return this.eventManager.on(APP_EVENTS.CONVERSION_START, callback);
  }

  onConversionSuccess(callback: (result: any) => void): EventSubscription {
    return this.eventManager.on(APP_EVENTS.CONVERSION_SUCCESS, callback);
  }

  onConversionError(callback: (error: Error) => void): EventSubscription {
    return this.eventManager.on(APP_EVENTS.CONVERSION_ERROR, callback);
  }

  // UI events
  onThemeChanged(callback: (isDark: boolean) => void): EventSubscription {
    return this.eventManager.on(APP_EVENTS.THEME_CHANGED, callback);
  }

  onLoadingStateChanged(
    callback: (isLoading: boolean) => void
  ): EventSubscription {
    return this.eventManager.on(APP_EVENTS.LOADING_STATE_CHANGED, callback);
  }

  // Error events
  onError(callback: (error: Error, context?: any) => void): EventSubscription {
    return this.eventManager.on(APP_EVENTS.ERROR_OCCURRED, callback);
  }

  onWarning(
    callback: (message: string, context?: any) => void
  ): EventSubscription {
    return this.eventManager.on(APP_EVENTS.WARNING_OCCURRED, callback);
  }
}
