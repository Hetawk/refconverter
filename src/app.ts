import { ConversionEngine } from "./converter/ConversionEngine.js";
import { FileManager } from "./utils/FileManager.js";
import { ResponseHandler } from "./handlers/ResponseHandler.js";
import { ThemeManager } from "./utils/ThemeManager.js";
import { ToastManager } from "./ui/ToastManager.js";

/**
 * Main Application Contro          <!-- Conversion Log Tab -->
          <div id="log-content" class="tab-content hidden h-full flex flex-col">
            <div class="h-full flex flex-col">
              <div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Conversion Log</h2>
                <button id="clearLog" class="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300">
                  Clear Log
                </button>
              </div>
              <div class="flex-1 min-h-0 overflow-auto">
                <div id="conversionLogContent" class="p-4 space-y-1 font-mono text-sm">
                  <div class="text-gray-500 dark:text-gray-400">No log entries yet...</div>
                </div>
              </div>
            </div>
          </div>ital Reference Converter
 * Simplified initialization with modular component integration
 */
export class App {
  private conversionEngine: ConversionEngine;
  private fileManager: FileManager;
  private responseHandler: ResponseHandler;
  private themeManager: ThemeManager;
  private toastManager: ToastManager;
  private conversionLog: string[] = [];
  private selectedFile: File | null = null;

  constructor() {
    this.conversionEngine = new ConversionEngine();
    this.fileManager = new FileManager();
    this.responseHandler = new ResponseHandler();
    this.themeManager = ThemeManager.getInstance();
    this.toastManager = ToastManager.getInstance();

    this.initialize();
  }

  /**
   * Add entry to conversion log with comprehensive logging
   */
  private addToLog(
    message: string,
    level: "INFO" | "WARNING" | "ERROR" | "SUCCESS" = "INFO"
  ): void {
    const timestamp = new Date().toLocaleString();
    const logEntry = `[${timestamp}] ${level}: ${message}`;
    this.conversionLog.push(logEntry);

    // Update log display
    this.updateLogDisplay();

    // Also log to console for debugging
    console.log(logEntry);
  }

  /**
   * Update the log display in the UI
   */
  private updateLogDisplay(): void {
    const logContainer = document.getElementById("conversionLogContent");
    if (logContainer) {
      logContainer.innerHTML = this.conversionLog
        .slice(-100) // Keep only last 100 entries
        .map((entry) => {
          const level = entry.match(/\[(.*?)\] (\w+):/);
          const levelClass = level ? this.getLogLevelClass(level[2]) : "";
          return `<div class="log-entry ${levelClass} p-2 border-b border-gray-100 dark:border-gray-700">${entry}</div>`;
        })
        .join("");

      // Scroll to bottom
      logContainer.scrollTop = logContainer.scrollHeight;
    }
  }

  /**
   * Get CSS class for log level
   */
  private getLogLevelClass(level: string): string {
    switch (level) {
      case "ERROR":
        return "text-red-600 dark:text-red-400";
      case "WARNING":
        return "text-yellow-600 dark:text-yellow-400";
      case "SUCCESS":
        return "text-green-600 dark:text-green-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  }

  /**
   * Initialize the application and inject modular components
   */
  private async initialize(): Promise<void> {
    console.log("🚀 EKD Digital RefConv - Initializing Application...");
    this.addToLog("Application starting up", "INFO");

    try {
      // Apply theme first to ensure proper theming during injection
      this.themeManager.setTheme(this.themeManager.isDark());

      // Inject component HTML into containers
      this.injectComponents();

      // Set up event listeners after components are rendered
      this.setupEventListeners();

      // Update theme icons after DOM is ready
      this.themeManager.updateThemeIcons();

      this.addToLog("Application initialized successfully", "SUCCESS");
      console.log("✅ Application initialized successfully");
    } catch (error) {
      this.addToLog(`Failed to initialize application: ${error}`, "ERROR");
      console.error("Failed to initialize application:", error);
    }
  }

  /**
   * Inject modular component HTML into container divs
   */
  private injectComponents(): void {
    // Inject Sidebar with File Upload and Conversion Options
    const sidebarContainer = document.getElementById("sidebar-container");
    if (sidebarContainer) {
      sidebarContainer.innerHTML = this.getSidebarHTML();
    }

    // Inject Main Content with Results and Log tabs
    const mainContentContainer = document.getElementById(
      "main-content-container"
    );
    if (mainContentContainer) {
      mainContentContainer.innerHTML = this.getMainContentHTML();
    }

    // Inject Mobile Menu
    const mobileMenuContainer = document.getElementById(
      "mobile-menu-container"
    );
    if (mobileMenuContainer) {
      mobileMenuContainer.innerHTML = this.getMobileMenuHTML();
    }

    this.addToLog("Components injected into DOM", "INFO");
  }

  /**
   * Get Sidebar HTML with all sub-components
   */
  private getSidebarHTML(): string {
    return `
      <aside id="sidebar" class="hidden md:flex md:flex-shrink-0 md:w-80">
        <div class="flex flex-col h-full w-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
          <!-- Sidebar Header -->
          <div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
            <div class="flex items-center space-x-3">
              <div class="w-8 h-8 flex items-center justify-center">
                <img src="assets/logo.png" alt="EKD Digital Logo" class="w-8 h-8 object-contain">
              </div>
              <div>
                <h1 class="text-lg font-semibold text-gray-900 dark:text-white">EKD Digital Reference Converter</h1>
                <p class="text-sm text-gray-500 dark:text-gray-400">XML to BibTeX</p>
              </div>
            </div>
            <button id="theme-toggle" class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <svg id="theme-icon-light" class="w-5 h-5 text-gray-600 dark:text-gray-400 hidden dark:block" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd"></path>
              </svg>
              <svg id="theme-icon-dark" class="w-5 h-5 text-gray-600 dark:text-gray-400 block dark:hidden" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path>
              </svg>
            </button>
          </div>

          <!-- Scrollable Content Area -->
          <div class="flex-1 overflow-y-auto">
            <!-- File Upload Section -->
            <div class="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 class="text-sm font-medium text-gray-900 dark:text-white mb-4">Select XML File</h2>
              <div class="file-upload-area border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors cursor-pointer">
                <svg class="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">Drag and drop your XML file here, or</p>
                <label for="xmlFile" class="cursor-pointer">
                  <span class="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 font-medium">browse files</span>
                  <input type="file" id="xmlFile" accept=".xml" class="sr-only">
                </label>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">XML files only</p>
              </div>
              <div id="file-info" class="mt-4 hidden">
                <div class="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd"></path>
                  </svg>
                  <span id="file-name"></span>
                  <span id="file-size" class="text-gray-400"></span>
                </div>
              </div>
            </div>

            <!-- Conversion Options -->
            <div class="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 class="text-sm font-medium text-gray-900 dark:text-white mb-4">Conversion Options</h2>
              
              <!-- Citation Style Selection -->
              <div class="mb-4">
                <label for="citationStyle" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Citation Style</label>
                <select id="citationStyle" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white">
                  <option value="standard">Standard BibTeX</option>
                  <option value="acm">ACM Style</option>
                  <option value="ieee">IEEE Style</option>
                  <option value="apa">APA Style</option>
                  <option value="harvard">Harvard Style</option>
                  <option value="chicago">Chicago Style</option>
                  <option value="biblatex">BibLaTeX</option>
                </select>
              </div>

              <!-- LaTeX Escaping -->
              <div class="mb-4">
                <label class="flex items-center">
                  <input type="checkbox" id="escapeLatex" checked class="rounded border-gray-300 dark:border-gray-600 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-offset-0 focus:ring-blue-200 focus:ring-opacity-50 dark:bg-gray-700">
                  <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">Escape LaTeX characters</span>
                </label>
              </div>

              <!-- Suppress Warnings -->
              <div class="mb-6">
                <label class="flex items-center">
                  <input type="checkbox" id="suppressWarnings" class="rounded border-gray-300 dark:border-gray-600 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-offset-0 focus:ring-blue-200 focus:ring-opacity-50 dark:bg-gray-700">
                  <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">Suppress warnings</span>
                </label>
              </div>

              <!-- Convert Button -->
              <button id="convertBtn" disabled class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors">
                Convert to BibTeX
              </button>
            </div>
          </div>

          <!-- App Information (Footer) -->
          <div class="p-6 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
            <div class="text-xs text-gray-500 dark:text-gray-400 space-y-1">
              <p>EKD Digital Reference Converter v1.0</p>
              <p>Convert XML references to BibTeX format</p>
            </div>
          </div>
        </div>
      </aside>
    `;
  }

  /**
   * Get Main Content HTML with tabs
   */
  private getMainContentHTML(): string {
    return `
      <main class="flex-1 flex flex-col min-h-0 overflow-hidden">
        <!-- Mobile Header -->
        <header class="md:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex-shrink-0">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <button id="mobile-menu-button" class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                <svg class="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                </svg>
              </button>
              <img src="assets/logo.png" alt="EKD Digital Logo" class="w-6 h-6 object-contain">
              <h1 class="text-lg font-semibold text-gray-900 dark:text-white">EKD Digital</h1>
            </div>
            <button id="mobile-theme-toggle" class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <svg class="w-5 h-5 text-gray-600 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd"></path>
              </svg>
            </button>
          </div>
        </header>

        <!-- Tab Navigation -->
        <div class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <nav class="flex w-full m-0 p-0" aria-label="Tabs">
            <button id="results-tab" class="flex-1 py-4 px-6 border-b-2 border-blue-500 font-medium text-sm text-blue-600 dark:text-blue-400 text-center whitespace-nowrap">
              Results
            </button>
            <button id="log-tab" class="flex-1 py-4 px-6 border-b-2 border-transparent font-medium text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 text-center whitespace-nowrap">
              Conversion Log
            </button>
          </nav>
        </div>

        <!-- Tab Content Container -->
        <div class="flex-1 min-h-0 overflow-hidden">
          <!-- Results Tab -->
          <div id="results-content" class="tab-content active h-full">
            <div class="h-full flex flex-col">
              <!-- Scrollable Results Area -->
              <div class="flex-1 min-h-0 overflow-y-auto">
                <div id="conversion-results" class="p-6">
                  <div class="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                    <div class="text-center">
                      <svg class="mx-auto h-12 w-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                      </svg>
                      <p class="text-lg font-medium mb-2">No conversion results yet</p>
                      <p class="text-sm">Select an XML file and click convert to see results here.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Sticky Action Buttons -->
              <div id="results-actions" class="hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 flex-shrink-0">
                <div class="flex flex-wrap gap-3">
                  <button id="copyToClipboard" class="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                    </svg>
                    <span>Copy to Clipboard</span>
                  </button>
                  <button id="saveToFile" class="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    <span>Save to File</span>
                  </button>
                  <button id="saveToCloud" class="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                    </svg>
                    <span>Save to Cloud</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Conversion Log Tab -->
          <div id="log-content" class="tab-content hidden h-full">
            <div class="h-full flex flex-col">
              <!-- Log Header -->
              <div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0">
                <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Conversion Log</h2>
                <button id="clearLog" class="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300">
                  Clear Log
                </button>
              </div>
              <!-- Scrollable Log Content -->
              <div class="flex-1 min-h-0 overflow-y-auto">
                <div id="conversionLogContent" class="p-4 space-y-1 font-mono text-sm">
                  <div class="text-gray-500 dark:text-gray-400">No log entries yet...</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    `;
  }

  /**
   * Get Mobile Menu HTML
   */
  private getMobileMenuHTML(): string {
    return `
      <!-- Mobile Menu -->
      <div id="mobile-menu" class="mobile-menu">
        <div class="mobile-menu-content">
          <!-- Mobile Menu Header -->
          <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Menu</h2>
            <button id="mobile-menu-close" class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
              <svg class="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <!-- Mobile Menu Content (same as sidebar content) -->
          <div class="p-4 space-y-6">
            <!-- File Upload Section -->
            <div>
              <h3 class="text-sm font-medium text-gray-900 dark:text-white mb-3">Select XML File</h3>
              <div class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">Upload your XML file</p>
                <label for="mobileXmlFile" class="cursor-pointer">
                  <span class="text-blue-600 dark:text-blue-400 font-medium">Choose file</span>
                  <input type="file" id="mobileXmlFile" accept=".xml" class="sr-only">
                </label>
              </div>
            </div>

            <!-- Conversion Options -->
            <div>
              <h3 class="text-sm font-medium text-gray-900 dark:text-white mb-3">Conversion Options</h3>
              
              <!-- Citation Style -->
              <div class="mb-3">
                <label for="mobileCitationStyle" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Citation Style</label>
                <select id="mobileCitationStyle" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white">
                  <option value="standard">Standard BibTeX</option>
                  <option value="acm">ACM Style</option>
                  <option value="ieee">IEEE Style</option>
                  <option value="apa">APA Style</option>
                  <option value="harvard">Harvard Style</option>
                  <option value="chicago">Chicago Style</option>
                  <option value="biblatex">BibLaTeX</option>
                </select>
              </div>

              <!-- Options checkboxes -->
              <div class="space-y-2">
                <label class="flex items-center">
                  <input type="checkbox" id="mobileEscapeLatex" checked class="rounded border-gray-300 dark:border-gray-600 text-blue-600">
                  <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">Escape LaTeX characters</span>
                </label>
                <label class="flex items-center">
                  <input type="checkbox" id="mobileSuppressWarnings" class="rounded border-gray-300 dark:border-gray-600 text-blue-600">
                  <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">Suppress warnings</span>
                </label>
              </div>

              <!-- Convert Button -->
              <button id="mobileConvertBtn" disabled class="w-full mt-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg">
                Convert to BibTeX
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Set up all event listeners for the application
   */
  private setupEventListeners(): void {
    this.setupFileUploadListeners();
    this.setupConversionListeners();
    this.setupTabListeners();
    this.setupActionListeners();
    this.setupThemeListeners();
    this.setupMobileMenuListeners();

    this.addToLog("Event listeners configured", "INFO");
  }

  private setupFileUploadListeners(): void {
    // Desktop file input
    const fileInput = document.getElementById("xmlFile") as HTMLInputElement;
    if (fileInput) {
      fileInput.addEventListener("change", (e) => this.handleFileSelection(e));
      this.addToLog("Desktop file input listener attached", "INFO");
    } else {
      this.addToLog("Desktop file input element not found", "WARNING");
    }

    // Mobile file input
    const mobileFileInput = document.getElementById(
      "mobileXmlFile"
    ) as HTMLInputElement;
    if (mobileFileInput) {
      mobileFileInput.addEventListener("change", (e) =>
        this.handleFileSelection(e)
      );
      this.addToLog("Mobile file input listener attached", "INFO");
    } else {
      this.addToLog("Mobile file input element not found", "WARNING");
    }

    // Make file upload areas clickable
    const fileUploadArea = document.querySelector(".file-upload-area");
    if (fileUploadArea) {
      fileUploadArea.addEventListener("click", () => {
        if (fileInput) {
          fileInput.click();
        }
      });
      this.addToLog("Desktop file upload area click listener attached", "INFO");
    }

    // Mobile file upload area (if it exists in mobile menu)
    const mobileFileUploadArea = document.querySelector(
      ".mobile-menu .file-upload-area"
    );
    if (mobileFileUploadArea) {
      mobileFileUploadArea.addEventListener("click", () => {
        if (mobileFileInput) {
          mobileFileInput.click();
        }
      });
      this.addToLog("Mobile file upload area click listener attached", "INFO");
    }
  }

  private setupConversionListeners(): void {
    // Desktop convert button
    const convertBtn = document.getElementById(
      "convertBtn"
    ) as HTMLButtonElement;
    if (convertBtn) {
      convertBtn.addEventListener("click", () => this.handleConversion());
    }

    // Mobile convert button
    const mobileConvertBtn = document.getElementById(
      "mobileConvertBtn"
    ) as HTMLButtonElement;
    if (mobileConvertBtn) {
      mobileConvertBtn.addEventListener("click", () => this.handleConversion());
    }
  }

  private setupTabListeners(): void {
    const resultsTab = document.getElementById("results-tab");
    const logTab = document.getElementById("log-tab");

    if (resultsTab) {
      resultsTab.addEventListener("click", () => this.switchTab("results"));
    }

    if (logTab) {
      logTab.addEventListener("click", () => this.switchTab("log"));
    }
  }

  private setupActionListeners(): void {
    const copyBtn = document.getElementById("copyToClipboard");
    const saveBtn = document.getElementById("saveToFile");
    const cloudBtn = document.getElementById("saveToCloud");
    const clearLogBtn = document.getElementById("clearLog");

    if (copyBtn) {
      copyBtn.addEventListener("click", () => this.handleCopyToClipboard());
    }

    if (saveBtn) {
      saveBtn.addEventListener("click", () => this.handleSaveToFile());
    }

    if (cloudBtn) {
      cloudBtn.addEventListener("click", () => this.handleSaveToCloud());
    }

    if (clearLogBtn) {
      clearLogBtn.addEventListener("click", () => this.clearLog());
    }
  }

  private setupThemeListeners(): void {
    const themeToggle = document.getElementById("theme-toggle");
    const mobileThemeToggle = document.getElementById("mobile-theme-toggle");

    if (themeToggle) {
      themeToggle.addEventListener("click", () => {
        this.themeManager.toggle();
        this.addToLog("Theme toggled", "INFO");
      });
    }

    if (mobileThemeToggle) {
      mobileThemeToggle.addEventListener("click", () => {
        this.themeManager.toggle();
        this.addToLog("Theme toggled (mobile)", "INFO");
      });
    }
  }

  private setupMobileMenuListeners(): void {
    const mobileMenuBtn = document.getElementById("mobile-menu-button");
    const mobileMenuClose = document.getElementById("mobile-menu-close");
    const mobileOverlay = document.getElementById("mobile-overlay");

    if (mobileMenuBtn) {
      mobileMenuBtn.addEventListener("click", () => {
        const mobileMenu = document.getElementById("mobile-menu");
        if (mobileMenu && mobileOverlay) {
          mobileMenu.classList.add("open");
          mobileOverlay.classList.add("open");
          document.body.style.overflow = "hidden";
        }
      });
    }

    if (mobileMenuClose) {
      mobileMenuClose.addEventListener("click", () => {
        const mobileMenu = document.getElementById("mobile-menu");
        if (mobileMenu && mobileOverlay) {
          mobileMenu.classList.remove("open");
          mobileOverlay.classList.remove("open");
          document.body.style.overflow = "";
        }
      });
    }

    if (mobileOverlay) {
      mobileOverlay.addEventListener("click", () => {
        const mobileMenu = document.getElementById("mobile-menu");
        if (mobileMenu) {
          mobileMenu.classList.remove("open");
          mobileOverlay.classList.remove("open");
          document.body.style.overflow = "";
        }
      });
    }
  }

  /**
   * Handle file selection
   */
  private handleFileSelection(event: Event): void {
    this.addToLog("File selection event triggered", "INFO");
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      this.selectedFile = file;
      this.addToLog(
        `File selected: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`,
        "INFO"
      );

      // Update file display
      this.updateFileDisplay(file);

      // Enable conversion buttons
      const convertBtn = document.getElementById(
        "convertBtn"
      ) as HTMLButtonElement;
      const mobileConvertBtn = document.getElementById(
        "mobileConvertBtn"
      ) as HTMLButtonElement;

      if (convertBtn) {
        convertBtn.disabled = false;
        this.addToLog("Desktop convert button enabled", "INFO");
      }
      if (mobileConvertBtn) {
        mobileConvertBtn.disabled = false;
        this.addToLog("Mobile convert button enabled", "INFO");
      }
    } else {
      this.addToLog("No file selected from input", "WARNING");
    }
  }

  /**
   * Update file display in UI
   */
  private updateFileDisplay(file: File): void {
    const fileInfo = document.getElementById("file-info");
    const fileName = document.getElementById("file-name");
    const fileSize = document.getElementById("file-size");

    if (fileInfo && fileName && fileSize) {
      fileName.textContent = file.name;
      fileSize.textContent = `(${(file.size / 1024).toFixed(2)} KB)`;
      fileInfo.classList.remove("hidden");
    }
  }

  /**
   * Get conversion options from UI
   */
  private getConversionOptions(): any {
    const citationStyle =
      (document.getElementById("citationStyle") as HTMLSelectElement)?.value ||
      (document.getElementById("mobileCitationStyle") as HTMLSelectElement)
        ?.value ||
      "standard";

    const escapeLatex =
      (document.getElementById("escapeLatex") as HTMLInputElement)?.checked ||
      (document.getElementById("mobileEscapeLatex") as HTMLInputElement)
        ?.checked ||
      true;

    const suppressWarnings =
      (document.getElementById("suppressWarnings") as HTMLInputElement)
        ?.checked ||
      (document.getElementById("mobileSuppressWarnings") as HTMLInputElement)
        ?.checked ||
      false;

    return {
      citationStyle,
      escapeLatex,
      suppressWarnings,
      includeAbstract: true,
      includeKeywords: true,
      includeNotes: true,
      preserveFormatting: false,
      customFields: [],
    };
  }

  /**
   * Handle XML to BibTeX conversion
   */
  private async handleConversion(): Promise<void> {
    if (!this.selectedFile) {
      this.toastManager.error("Please select an XML file first");
      this.addToLog("Conversion attempted without file selection", "WARNING");
      return;
    }

    try {
      this.addToLog(`Starting conversion of ${this.selectedFile.name}`, "INFO");

      // Read file content
      const content = await this.fileManager.readFileAsText(this.selectedFile);
      this.addToLog("File content read successfully", "INFO");

      // Get conversion options
      const conversionOptions = this.getConversionOptions();
      this.addToLog(
        `Conversion options: ${JSON.stringify(conversionOptions)}`,
        "INFO"
      );

      // Perform conversion
      const result = await this.conversionEngine.convertXMLToBibTeX(
        content,
        conversionOptions
      );

      if (result.bibtex) {
        this.addToLog(
          `Conversion completed successfully. Generated ${
            result.bibtex.split("\n").length
          } lines`,
          "SUCCESS"
        );

        // Display results
        this.displayResults(result.bibtex, result.warnings || []);

        // Switch to results tab
        this.switchTab("results");

        this.toastManager.success("Conversion completed successfully!");
      } else {
        throw new Error("Conversion failed");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.addToLog(`Conversion failed: ${errorMessage}`, "ERROR");
      this.toastManager.error(`Conversion failed: ${errorMessage}`);
    }
  }

  /**
   * Display conversion results
   */
  private displayResults(bibTeX: string, warnings: string[]): void {
    const resultsContainer = document.getElementById("conversion-results");
    const actionsContainer = document.getElementById("results-actions");

    if (resultsContainer) {
      resultsContainer.innerHTML = `
        <div class="space-y-4">
          ${
            warnings.length > 0
              ? `
            <div class="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <h3 class="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">Conversion Warnings:</h3>
              <div class="max-h-32 overflow-y-auto">
                <ul class="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                  ${warnings.map((warning) => `<li>• ${warning}</li>`).join("")}
                </ul>
              </div>
            </div>
          `
              : ""
          }
          
          <!-- BibTeX Results Header -->
          <div class="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-700">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">BibTeX Output</h3>
            <span class="text-sm text-gray-500 dark:text-gray-400">${
              bibTeX.split("\n").length
            } lines</span>
          </div>
          
          <!-- BibTeX Content - Full Width -->
          <div class="w-full">
            <pre class="text-sm font-mono text-gray-900 dark:text-gray-100 whitespace-pre-wrap leading-relaxed w-full"><code>${this.escapeHtml(
              bibTeX
            )}</code></pre>
          </div>
        </div>
      `;
    }

    if (actionsContainer) {
      actionsContainer.classList.remove("hidden");
    }

    // Store results for save/copy operations
    (window as any).conversionResults = bibTeX;
  }

  /**
   * Escape HTML for safe display
   */
  private escapeHtml(text: string): string {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Switch between tabs
   */
  private switchTab(tab: string): void {
    // Update tab buttons
    const resultsTab = document.getElementById("results-tab");
    const logTab = document.getElementById("log-tab");

    // Update content containers
    const resultsContent = document.getElementById("results-content");
    const logContent = document.getElementById("log-content");

    if (tab === "results") {
      resultsTab?.classList.add(
        "active",
        "border-blue-500",
        "text-blue-600",
        "dark:text-blue-400"
      );
      resultsTab?.classList.remove(
        "border-transparent",
        "text-gray-500",
        "dark:text-gray-400"
      );

      logTab?.classList.remove(
        "active",
        "border-blue-500",
        "text-blue-600",
        "dark:text-blue-400"
      );
      logTab?.classList.add(
        "border-transparent",
        "text-gray-500",
        "dark:text-gray-400"
      );

      resultsContent?.classList.remove("hidden");
      resultsContent?.classList.add("active");
      logContent?.classList.add("hidden");
      logContent?.classList.remove("active");
    } else if (tab === "log") {
      logTab?.classList.add(
        "active",
        "border-blue-500",
        "text-blue-600",
        "dark:text-blue-400"
      );
      logTab?.classList.remove(
        "border-transparent",
        "text-gray-500",
        "dark:text-gray-400"
      );

      resultsTab?.classList.remove(
        "active",
        "border-blue-500",
        "text-blue-600",
        "dark:text-blue-400"
      );
      resultsTab?.classList.add(
        "border-transparent",
        "text-gray-500",
        "dark:text-gray-400"
      );

      logContent?.classList.remove("hidden");
      logContent?.classList.add("active");
      resultsContent?.classList.add("hidden");
      resultsContent?.classList.remove("active");
    }

    this.addToLog(`Switched to ${tab} tab`, "INFO");
  }

  /**
   * Handle copy to clipboard
   */
  private async handleCopyToClipboard(): Promise<void> {
    try {
      const content = (window as any).conversionResults;
      if (!content) {
        this.toastManager.error("No content to copy");
        return;
      }

      await navigator.clipboard.writeText(content);
      this.addToLog("Results copied to clipboard", "SUCCESS");
      this.toastManager.success("Copied to clipboard!");
    } catch (error) {
      this.addToLog("Failed to copy to clipboard", "ERROR");
      this.toastManager.error("Failed to copy to clipboard");
    }
  }

  /**
   * Handle save to file
   */
  private async handleSaveToFile(): Promise<void> {
    try {
      const content = (window as any).conversionResults;
      if (!content) {
        this.toastManager.error("No content to save");
        return;
      }

      await this.fileManager.saveToFile(content, "references.bib");
      this.addToLog("Results saved to file successfully", "SUCCESS");
      this.toastManager.success("File saved successfully!");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.addToLog(`Failed to save file: ${errorMessage}`, "ERROR");
      this.toastManager.error("Failed to save file");
    }
  }

  /**
   * Handle save to cloud (placeholder for future implementation)
   */
  private async handleSaveToCloud(): Promise<void> {
    this.addToLog("Cloud save feature not yet implemented", "WARNING");
    this.toastManager.info("Cloud save feature coming soon!");
  }

  /**
   * Clear conversion log
   */
  public clearLog(): void {
    this.conversionLog = [];
    this.updateLogDisplay();
    this.addToLog("Conversion log cleared", "INFO");
  }

  /**
   * Get current conversion log
   */
  public getConversionLog(): string[] {
    return [...this.conversionLog];
  }
}

// Initialize application when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  new App();
});
