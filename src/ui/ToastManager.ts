/**
 * Toast Notification System
 * Centralized notification management following DRY principles
 */
export interface ToastOptions {
  duration?: number;
  position?:
    | "top-right"
    | "top-left"
    | "bottom-right"
    | "bottom-left"
    | "top-center";
  closable?: boolean;
  action?: {
    text: string;
    handler: () => void;
  };
}

export type ToastType = "success" | "error" | "warning" | "info";

export class ToastManager {
  private static instance: ToastManager;
  private toasts: Map<string, HTMLElement> = new Map();
  private toastCounter: number = 0;

  private constructor() {
    this.createContainer();
  }

  static getInstance(): ToastManager {
    if (!ToastManager.instance) {
      ToastManager.instance = new ToastManager();
    }
    return ToastManager.instance;
  }

  /**
   * Create toast container if it doesn't exist
   */
  private createContainer(): void {
    const existingContainer = document.getElementById("toast-container");
    if (existingContainer) return;

    const container = document.createElement("div");
    container.id = "toast-container";
    container.className =
      "fixed top-4 right-4 z-50 space-y-2 pointer-events-none";
    document.body.appendChild(container);
  }

  /**
   * Show a success toast
   */
  success(message: string, options?: ToastOptions): string {
    return this.show("success", message, options);
  }

  /**
   * Show an error toast
   */
  error(message: string, options?: ToastOptions): string {
    return this.show("error", message, options);
  }

  /**
   * Show a warning toast
   */
  warning(message: string, options?: ToastOptions): string {
    return this.show("warning", message, options);
  }

  /**
   * Show an info toast
   */
  info(message: string, options?: ToastOptions): string {
    return this.show("info", message, options);
  }

  /**
   * Show a toast notification
   */
  private show(
    type: ToastType,
    message: string,
    options: ToastOptions = {}
  ): string {
    const toastId = `toast-${++this.toastCounter}`;
    const {
      duration = 5000,
      position = "top-right",
      closable = true,
      action,
    } = options;

    const toast = this.createToastElement(
      toastId,
      type,
      message,
      closable,
      action
    );
    this.positionToast(toast, position);

    // Store reference
    this.toasts.set(toastId, toast);

    // Animate in
    this.animateIn(toast);

    // Auto-remove if duration is set
    if (duration > 0) {
      setTimeout(() => {
        this.dismiss(toastId);
      }, duration);
    }

    return toastId;
  }

  /**
   * Dismiss a specific toast
   */
  dismiss(toastId: string): void {
    const toast = this.toasts.get(toastId);
    if (!toast) return;

    this.animateOut(toast, () => {
      toast.remove();
      this.toasts.delete(toastId);
    });
  }

  /**
   * Dismiss all toasts
   */
  dismissAll(): void {
    this.toasts.forEach((_, id) => this.dismiss(id));
  }

  /**
   * Create toast element
   */
  private createToastElement(
    id: string,
    type: ToastType,
    message: string,
    closable: boolean,
    action?: { text: string; handler: () => void }
  ): HTMLElement {
    const toast = document.createElement("div");
    toast.id = id;
    toast.className = `
            min-w-96 max-w-lg w-auto bg-white dark:bg-gray-800 shadow-lg rounded-lg 
            pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden
            transform transition-all duration-300 ease-in-out translate-x-full opacity-0
            ${this.getTypeClasses(type)}
        `;

    toast.innerHTML = `
            <div class="p-4">
                <div class="flex items-start">
                    <div class="flex-shrink-0">
                        ${this.getTypeIcon(type)}
                    </div>
                    <div class="ml-3 flex-1 min-w-0">
                        <p class="text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap">
                            ${message}
                        </p>
                        ${
                          action
                            ? `
                            <div class="mt-3">
                                <button class="toast-action-btn text-sm font-medium ${this.getActionButtonClasses(
                                  type
                                )} hover:underline focus:outline-none focus:underline">
                                    ${action.text}
                                </button>
                            </div>
                        `
                            : ""
                        }
                    </div>
                    ${
                      closable
                        ? `
                        <div class="ml-4 flex-shrink-0 flex">
                            <button class="toast-close-btn bg-white dark:bg-gray-800 rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                <span class="sr-only">Close</span>
                                <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                                </svg>
                            </button>
                        </div>
                    `
                        : ""
                    }
                </div>
            </div>
        `;

    // Add event listeners
    if (closable) {
      const closeBtn = toast.querySelector(".toast-close-btn");
      closeBtn?.addEventListener("click", () => this.dismiss(id));
    }

    if (action) {
      const actionBtn = toast.querySelector(".toast-action-btn");
      actionBtn?.addEventListener("click", () => {
        action.handler();
        this.dismiss(id);
      });
    }

    return toast;
  }

  /**
   * Position toast based on position preference
   */
  private positionToast(toast: HTMLElement, position: string): void {
    let container = document.getElementById(`toast-container-${position}`);

    if (!container) {
      container = document.createElement("div");
      container.id = `toast-container-${position}`;
      container.className = this.getContainerClasses(position);
      document.body.appendChild(container);
    }

    container.appendChild(toast);
  }

  /**
   * Get container classes based on position
   */
  private getContainerClasses(position: string): string {
    const baseClasses = "fixed z-50 space-y-2 pointer-events-none";

    switch (position) {
      case "top-right":
        return `${baseClasses} top-4 right-4`;
      case "top-left":
        return `${baseClasses} top-4 left-4`;
      case "bottom-right":
        return `${baseClasses} bottom-4 right-4`;
      case "bottom-left":
        return `${baseClasses} bottom-4 left-4`;
      case "top-center":
        return `${baseClasses} top-4 left-1/2 transform -translate-x-1/2`;
      default:
        return `${baseClasses} top-4 right-4`;
    }
  }

  /**
   * Get type-specific classes
   */
  private getTypeClasses(type: ToastType): string {
    switch (type) {
      case "success":
        return "border-l-4 border-green-400";
      case "error":
        return "border-l-4 border-red-400";
      case "warning":
        return "border-l-4 border-yellow-400";
      case "info":
        return "border-l-4 border-blue-400";
      default:
        return "";
    }
  }

  /**
   * Get type-specific icon
   */
  private getTypeIcon(type: ToastType): string {
    switch (type) {
      case "success":
        return `<svg class="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>`;
      case "error":
        return `<svg class="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>`;
      case "warning":
        return `<svg class="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>`;
      case "info":
        return `<svg class="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>`;
      default:
        return "";
    }
  }

  /**
   * Get action button classes
   */
  private getActionButtonClasses(type: ToastType): string {
    switch (type) {
      case "success":
        return "text-green-600 hover:text-green-500";
      case "error":
        return "text-red-600 hover:text-red-500";
      case "warning":
        return "text-yellow-600 hover:text-yellow-500";
      case "info":
        return "text-blue-600 hover:text-blue-500";
      default:
        return "text-gray-600 hover:text-gray-500";
    }
  }

  /**
   * Animate toast in
   */
  private animateIn(toast: HTMLElement): void {
    // Force reflow
    toast.offsetHeight;

    toast.classList.remove("translate-x-full", "opacity-0");
    toast.classList.add("translate-x-0", "opacity-100");
  }

  /**
   * Animate toast out
   */
  private animateOut(toast: HTMLElement, callback: () => void): void {
    toast.classList.remove("translate-x-0", "opacity-100");
    toast.classList.add("translate-x-full", "opacity-0");

    setTimeout(callback, 300);
  }
}
