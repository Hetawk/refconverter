/**
 * Results Tab Component - Handles the conversion results display
 */
export class ResultsTabComponent {
  private container: HTMLElement;

  constructor(containerId: string) {
    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error(`Container with ID '${containerId}' not found`);
    }
    this.container = container;
    this.render();
  }

  private render(): void {
    this.container.innerHTML = `
      <div id="resultsTabContent" class="tab-content">
        <!-- Results Section -->
        <div id="resultSection" class="hidden">
          <!-- Warning Container -->
          <div id="warningContainer" class="space-y-2 mb-4 hidden"></div>

          <!-- Conversion Statistics -->
          <div class="mb-4 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">Conversion Results</h3>
            <div id="conversionStats"></div>
          </div>

          <!-- Output Textarea -->
          <div class="mb-6">
            <label for="outputTextarea" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">BibTeX Output</label>
            <textarea id="outputTextarea" rows="15" readonly
              class="w-full px-4 py-3 font-mono text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"></textarea>
          </div>

          <!-- Save Options -->
          <div class="flex flex-col sm:flex-row gap-3">
            <button id="saveToFile"
              class="save-button inline-flex items-center justify-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 shadow-sm hover:shadow-md">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              Save to File
            </button>
            
            <button id="copyToClipboard"
              class="save-button inline-flex items-center justify-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 text-sm font-medium rounded-lg border border-gray-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100 dark:border-gray-600">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
              </svg>
              Copy to Clipboard
            </button>
            
            <button id="saveToCloud"
              class="save-button inline-flex items-center justify-center px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-900 text-sm font-medium rounded-lg border border-blue-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 dark:text-blue-200 dark:border-blue-800">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
              </svg>
              Save to Cloud
            </button>
          </div>
        </div>

        <!-- Welcome Message (shown when no results) -->
        <div id="welcomeMessage" class="text-center py-12">
          <div class="mx-auto w-24 h-24 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-6">
            <svg class="w-12 h-12 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
          </div>
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">Welcome to EKD Digital Reference Converter</h2>
          <p class="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-8">
            Transform your reference files into clean, properly formatted BibTeX entries with advanced parsing and intelligent field detection.
          </p>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div class="text-center">
              <div class="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                <svg class="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h3 class="text-sm font-medium text-gray-900 dark:text-white mb-1">Multiple Formats</h3>
              <p class="text-xs text-gray-600 dark:text-gray-400">Supports XML, RIS, and ENW files</p>
            </div>
            <div class="text-center">
              <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
              </div>
              <h3 class="text-sm font-medium text-gray-900 dark:text-white mb-1">Lightning Fast</h3>
              <p class="text-xs text-gray-600 dark:text-gray-400">Process thousands of references in seconds</p>
            </div>
            <div class="text-center">
              <div class="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                <svg class="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"></path>
                </svg>
              </div>
              <h3 class="text-sm font-medium text-gray-900 dark:text-white mb-1">Customizable</h3>
              <p class="text-xs text-gray-600 dark:text-gray-400">Fine-tune output with advanced options</p>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}
