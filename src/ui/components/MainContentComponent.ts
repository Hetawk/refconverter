/**
 * Main Content Component - Handles the tab navigation and content display
 */
export class MainContentComponent {
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
      <main class="flex-1 min-w-0 flex flex-col bg-gray-50 dark:bg-gray-900">
        <!-- Mobile Header -->
        <header class="md:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div>
                <h1 class="text-lg font-semibold text-gray-900 dark:text-white">Reference Converter</h1>
                <p class="text-xs text-gray-500 dark:text-gray-400">EKD Digital</p>
              </div>
            </div>
            <button id="mobile-menu-button"
              class="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
          </div>
        </header>

        <!-- Content Area -->
        <div class="flex-1 p-6">
          <div class="max-w-4xl mx-auto">
            <!-- Tab Navigation -->
            <div class="border-b border-gray-200 dark:border-gray-700 mb-6">
              <nav class="-mb-px flex space-x-8">
                <button id="resultsTab" class="tab-button active border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm">
                  Conversion Results
                </button>
                <button id="logTab" class="tab-button border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm">
                  Conversion Log
                </button>
              </nav>
            </div>

            <!-- Tab Content -->
            <div id="results-tab-content"></div>
            <div id="log-tab-content"></div>
          </div>
        </div>
      </main>
    `;
  }
}
