/**
 * Sidebar Component - Handles the sidebar layout and interactions
 * Contains file upload, conversion options, and theme toggle
 */
export class SidebarComponent {
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
      <aside id="sidebar" class="hidden md:flex md:flex-shrink-0">
        <div class="flex flex-col w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
          <!-- Sidebar Header -->
          <div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
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
            <button id="theme-toggle"
              class="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <span id="theme-icon">
                <!-- Theme icon will be set by JavaScript -->
              </span>
            </button>
          </div>

          <!-- File Upload Section -->
          <div id="file-upload-section"></div>

          <!-- Conversion Options -->
          <div id="conversion-options-section"></div>

          <!-- Convert Button -->
          <div class="p-6 border-t border-gray-200 dark:border-gray-700">
            <button id="convertBtn"
              class="w-full inline-flex items-center justify-center px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md">
              <span id="loadingSpinner" class="loading-spinner mr-2 hidden"></span>
              <span id="convertText">Convert to BibTeX</span>
            </button>
          </div>
        </div>
      </aside>
    `;
  }

  public getContainer(): HTMLElement {
    return this.container;
  }
}
