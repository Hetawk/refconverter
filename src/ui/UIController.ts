import { ConversionOptions } from "../converter/ConversionEngine.js";

/**
 * UI Controller manages all user interface interactions
 * Handles responsive design, theme switching, and user feedback
 */
export class UIController {
  private currentResults: string | null = null;
  private isMobileMenuOpen: boolean = false;

  constructor() {
    console.log("🎨 UIController initialized");
  }

  initialize(): void {
    this.setupResponsiveHandlers();
    this.initializeToggleSwitches();
    this.setupKeyboardShortcuts();
  }

  /**
   * Set up responsive design handlers
   */
  private setupResponsiveHandlers(): void {
    // Handle window resize
    window.addEventListener("resize", () => {
      this.handleResize();
    });

    // Handle orientation change on mobile
    window.addEventListener("orientationchange", () => {
      setTimeout(() => this.handleResize(), 100);
    });

    // Close mobile menu when clicking outside
    document.addEventListener("click", (e) => {
      const target = e.target as HTMLElement;
      const mobileMenu = document.getElementById("mobile-menu");
      const menuButton = document.getElementById("mobile-menu-button");

      if (
        this.isMobileMenuOpen &&
        mobileMenu &&
        !mobileMenu.contains(target) &&
        !menuButton?.contains(target)
      ) {
        this.closeMobileMenu();
      }
    });
  }

  /**
   * Initialize toggle switches with proper styling
   */
  private initializeToggleSwitches(): void {
    const toggles = document.querySelectorAll(
      '.toggle-switch input[type="checkbox"]'
    );

    toggles.forEach((toggle) => {
      // Add event listener for visual feedback
      toggle.addEventListener("change", (e) => {
        const checkbox = e.target as HTMLInputElement;
        const slider = checkbox.nextElementSibling;

        if (slider) {
          if (checkbox.checked) {
            slider.classList.add("bg-primary-500");
            slider.classList.remove("bg-gray-300");
          } else {
            slider.classList.add("bg-gray-300");
            slider.classList.remove("bg-primary-500");
          }
        }
      });
    });
  }

  /**
   * Set up keyboard shortcuts
   */
  private setupKeyboardShortcuts(): void {
    document.addEventListener("keydown", (e) => {
      // Ctrl/Cmd + Enter to convert
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        const convertBtn = document.getElementById(
          "convertBtn"
        ) as HTMLButtonElement;
        if (convertBtn && !convertBtn.disabled) {
          convertBtn.click();
        }
      }

      // Ctrl/Cmd + S to save (if results exist)
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        if (this.currentResults) {
          const saveBtn = document.getElementById(
            "saveToFile"
          ) as HTMLButtonElement;
          if (saveBtn) saveBtn.click();
        }
      }

      // Escape to close mobile menu
      if (e.key === "Escape" && this.isMobileMenuOpen) {
        this.closeMobileMenu();
      }
    });
  }

  /**
   * Handle window resize events
   */
  private handleResize(): void {
    const width = window.innerWidth;

    // Close mobile menu on desktop
    if (width >= 768 && this.isMobileMenuOpen) {
      this.closeMobileMenu();
    }

    // Adjust layout for different screen sizes
    this.adjustLayoutForScreenSize(width);
  }

  /**
   * Adjust layout based on screen size
   */
  private adjustLayoutForScreenSize(width: number): void {
    const container = document.querySelector(".container") as HTMLElement;
    const sidebar = document.querySelector(".sidebar") as HTMLElement;
    const mainContent = document.querySelector(".main-content") as HTMLElement;

    if (!container || !sidebar || !mainContent) return;

    if (width < 768) {
      // Mobile layout
      container.classList.add("mobile-layout");
      sidebar.classList.add("hidden", "md:block");
      mainContent.classList.add("w-full");
    } else if (width < 1024) {
      // Tablet layout
      container.classList.remove("mobile-layout");
      sidebar.classList.remove("hidden");
      sidebar.classList.add("md:block");
      mainContent.classList.remove("w-full");
    } else {
      // Desktop layout
      container.classList.remove("mobile-layout");
      sidebar.classList.remove("hidden", "md:block");
      mainContent.classList.remove("w-full");
    }
  }

  /**
   * Toggle mobile menu
   */
  toggleMobileMenu(): void {
    if (this.isMobileMenuOpen) {
      this.closeMobileMenu();
    } else {
      this.openMobileMenu();
    }
  }

  /**
   * Open mobile menu
   */
  private openMobileMenu(): void {
    const mobileMenu = document.getElementById("mobile-menu");
    const overlay = document.getElementById("mobile-overlay");

    if (mobileMenu && overlay) {
      mobileMenu.classList.remove("translate-x-full");
      mobileMenu.classList.add("translate-x-0");
      overlay.classList.remove("hidden");
      overlay.classList.add("opacity-50");

      document.body.style.overflow = "hidden";
      this.isMobileMenuOpen = true;
    }
  }

  /**
   * Close mobile menu
   */
  private closeMobileMenu(): void {
    const mobileMenu = document.getElementById("mobile-menu");
    const overlay = document.getElementById("mobile-overlay");

    if (mobileMenu && overlay) {
      mobileMenu.classList.remove("translate-x-0");
      mobileMenu.classList.add("translate-x-full");
      overlay.classList.remove("opacity-50");
      overlay.classList.add("hidden");

      document.body.style.overflow = "";
      this.isMobileMenuOpen = false;
    }
  }

  /**
   * Show loading state
   */
  showLoading(show: boolean): void {
    const convertBtn = document.getElementById(
      "convertBtn"
    ) as HTMLButtonElement;
    const loadingSpinner = document.getElementById("loadingSpinner");
    const convertText = document.getElementById("convertText");

    if (convertBtn && loadingSpinner && convertText) {
      if (show) {
        convertBtn.disabled = true;
        loadingSpinner.classList.remove("hidden");
        convertText.textContent = "Converting...";
        convertBtn.classList.add("opacity-75");
      } else {
        convertBtn.disabled = false;
        loadingSpinner.classList.add("hidden");
        convertText.textContent = "Convert to BibTeX";
        convertBtn.classList.remove("opacity-75");
      }
    }
  }

  /**
   * Clear conversion results
   */
  clearResults(): void {
    const resultSection = document.getElementById("resultSection");
    const outputTextarea = document.getElementById(
      "outputTextarea"
    ) as HTMLTextAreaElement;

    if (resultSection) {
      resultSection.classList.add("hidden");
    }

    if (outputTextarea) {
      outputTextarea.value = "";
    }

    this.currentResults = null;
    this.showSaveButtons(false);
  }

  /**
   * Display conversion results
   */
  displayResults(result: any): void {
    const resultSection = document.getElementById("resultSection");
    const outputTextarea = document.getElementById(
      "outputTextarea"
    ) as HTMLTextAreaElement;
    const statsElement = document.getElementById("conversionStats");

    if (resultSection && outputTextarea) {
      // Show results
      resultSection.classList.remove("hidden");
      outputTextarea.value = result.bibtex;
      this.currentResults = result.bibtex;

      // Show statistics
      if (statsElement) {
        statsElement.innerHTML = `
                    <div class="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <span class="flex items-center gap-1">
                            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            ${result.entryCount} references
                        </span>
                        <span class="flex items-center gap-1">
                            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"></path>
                            </svg>
                            ${result.processingTime}ms
                        </span>
                        ${
                          result.warnings.length > 0
                            ? `
                            <span class="flex items-center gap-1 text-yellow-600">
                                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                                </svg>
                                ${result.warnings.length} warnings
                            </span>
                        `
                            : ""
                        }
                    </div>
                `;
      }

      // Show warnings if any
      if (result.warnings.length > 0) {
        this.showWarnings(result.warnings);
      }

      // Auto-resize textarea
      this.autoResizeTextarea(outputTextarea);
    }
  }

  /**
   * Auto-resize textarea to fit content
   */
  private autoResizeTextarea(textarea: HTMLTextAreaElement): void {
    textarea.style.height = "auto";
    textarea.style.height = Math.min(textarea.scrollHeight, 400) + "px";
  }

  /**
   * Show warnings to user
   */
  private showWarnings(warnings: string[]): void {
    const warningContainer =
      document.getElementById("warningContainer") ||
      this.createWarningContainer();

    warningContainer.innerHTML = warnings
      .map(
        (warning) => `
            <div class="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <svg class="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                </svg>
                <span class="text-sm text-yellow-800 dark:text-yellow-200">${warning}</span>
            </div>
        `
      )
      .join("");

    warningContainer.classList.remove("hidden");
  }

  /**
   * Create warning container if it doesn't exist
   */
  private createWarningContainer(): HTMLElement {
    const container = document.createElement("div");
    container.id = "warningContainer";
    container.className = "space-y-2 mb-4 hidden";

    const resultSection = document.getElementById("resultSection");
    if (resultSection) {
      resultSection.insertBefore(container, resultSection.firstChild);
    }

    return container;
  }

  /**
   * Show/hide save buttons
   */
  showSaveButtons(show: boolean): void {
    const saveButtons = document.querySelectorAll(".save-button");

    saveButtons.forEach((button) => {
      if (show) {
        button.classList.remove("hidden");
      } else {
        button.classList.add("hidden");
      }
    });
  }

  /**
   * Update file display info
   */
  updateFileDisplay(filename: string, size: number): void {
    const fileInfo = document.getElementById("fileInfo");
    const fileNameElement = document.getElementById("fileName");
    const fileSizeElement = document.getElementById("fileSize");

    if (fileInfo && fileNameElement && fileSizeElement) {
      fileNameElement.textContent = filename;
      fileSizeElement.textContent = this.formatFileSize(size);
      fileInfo.classList.remove("hidden");
    }

    // Also update the selectedFileDetails section
    const selectedFileDetails = document.getElementById("selectedFileDetails");
    if (selectedFileDetails) {
      selectedFileDetails.innerHTML = `
        <div class="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div class="flex-shrink-0">
            <svg class="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
          </div>
          <div class="flex-1 min-w-0">
            <h4 class="text-sm font-medium text-gray-900 dark:text-white truncate">${filename}</h4>
            <p class="text-sm text-gray-500 dark:text-gray-400">${this.formatFileSize(
              size
            )} • ${this.getFileType(filename)}</p>
          </div>
          <div class="flex-shrink-0">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
              Ready
            </span>
          </div>
        </div>
      `;
      selectedFileDetails.classList.remove("hidden");
    }
  }

  /**
   * Format file size for display
   */
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  /**
   * Get file type description from filename
   */
  private getFileType(filename: string): string {
    const extension = filename.split(".").pop()?.toLowerCase();
    switch (extension) {
      case "xml":
        return "XML Document";
      case "ris":
        return "RIS Reference";
      case "enw":
        return "EndNote Library";
      case "bib":
        return "BibTeX File";
      default:
        return "Reference File";
    }
  }

  /**
   * Get current conversion options from UI
   */
  getConversionOptions(): ConversionOptions {
    const includeAbstract =
      (document.getElementById("includeAbstract") as HTMLInputElement)
        ?.checked || false;
    const includeKeywords =
      (document.getElementById("includeKeywords") as HTMLInputElement)
        ?.checked || false;
    const includeNotes =
      (document.getElementById("includeNotes") as HTMLInputElement)?.checked ||
      false;
    const preserveFormatting =
      (document.getElementById("preserveFormatting") as HTMLInputElement)
        ?.checked || false;

    // Get custom fields from input
    const customFieldsInput = document.getElementById(
      "customFields"
    ) as HTMLInputElement;
    const customFields =
      customFieldsInput?.value
        .split(",")
        .map((field) => field.trim())
        .filter((field) => field) || [];

    // Get citation style
    const citationStyleSelect = document.getElementById(
      "citationStyle"
    ) as HTMLSelectElement;
    const citationStyle = citationStyleSelect?.value || "standard";

    // Get advanced options
    const escapeLatex =
      (document.getElementById("escapeLatex") as HTMLInputElement)?.checked ||
      false;
    const suppressWarnings =
      (document.getElementById("suppressWarnings") as HTMLInputElement)
        ?.checked || false;

    return {
      includeAbstract,
      includeKeywords,
      includeNotes,
      preserveFormatting,
      customFields,
      citationStyle,
      escapeLatex,
      suppressWarnings,
    };
  }

  /**
   * Get current results
   */
  getCurrentResults(): string | null {
    return this.currentResults;
  }

  /**
   * Show success message
   */
  showSuccess(message: string): void {
    this.showToast(message, "success");
  }

  /**
   * Show error message
   */
  showError(message: string): void {
    this.showToast(message, "error");
  }

  /**
   * Show info message
   */
  showInfo(message: string): void {
    this.showToast(message, "info");
  }

  /**
   * Show toast notification
   */
  private showToast(message: string, type: "success" | "error" | "info"): void {
    const toast = document.createElement("div");
    toast.className = `fixed top-4 right-4 z-50 max-w-sm p-4 rounded-lg shadow-lg transform transition-all duration-300 translate-x-full ${this.getToastClasses(
      type
    )}`;

    toast.innerHTML = `
            <div class="flex items-center gap-3">
                ${this.getToastIcon(type)}
                <span class="text-sm font-medium">${message}</span>
                <button class="ml-auto text-gray-400 hover:text-gray-600" onclick="this.parentElement.parentElement.remove()">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                    </svg>
                </button>
            </div>
        `;

    document.body.appendChild(toast);

    // Animate in
    setTimeout(() => {
      toast.classList.remove("translate-x-full");
      toast.classList.add("translate-x-0");
    }, 100);

    // Auto remove after 5 seconds
    setTimeout(() => {
      toast.classList.add("translate-x-full");
      setTimeout(() => toast.remove(), 300);
    }, 5000);
  }

  /**
   * Get toast CSS classes based on type
   */
  private getToastClasses(type: "success" | "error" | "info"): string {
    switch (type) {
      case "success":
        return "bg-green-50 border border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200";
      case "error":
        return "bg-red-50 border border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200";
      case "info":
        return "bg-blue-50 border border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200";
      default:
        return "bg-gray-50 border border-gray-200 text-gray-800 dark:bg-gray-900/20 dark:border-gray-800 dark:text-gray-200";
    }
  }

  /**
   * Get toast icon based on type
   */
  private getToastIcon(type: "success" | "error" | "info"): string {
    switch (type) {
      case "success":
        return '<svg class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>';
      case "error":
        return '<svg class="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path></svg>';
      case "info":
        return '<svg class="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path></svg>';
      default:
        return "";
    }
  }

  /**
   * Update theme icon
   */
  updateThemeIcon(isDark: boolean): void {
    const themeIcon = document.getElementById("theme-icon");
    if (themeIcon) {
      themeIcon.innerHTML = isDark
        ? '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd"></path></svg>'
        : '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path></svg>';
    }
  }
}
