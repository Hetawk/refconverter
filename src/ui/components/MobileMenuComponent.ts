/**
 * Mobile Menu Component - Handles mobile navigation
 */
export class MobileMenuComponent {
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
      <div id="mobile-menu" class="mobile-menu">
        <div class="flex flex-col h-full">
          <!-- Mobile Menu Header -->
          <div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Conversion Options</h2>
            <button id="mobile-menu-close"
              class="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <!-- Mobile Menu Content -->
          <div class="flex-1 overflow-y-auto p-6">
            <!-- Theme Toggle -->
            <div class="mb-6">
              <button id="mobile-theme-toggle"
                class="w-full flex items-center justify-between p-3 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <span class="text-sm font-medium">Theme</span>
                <span id="mobile-theme-icon">
                  <!-- Theme icon will be set by JavaScript -->
                </span>
              </button>
            </div>

            <!-- File Upload (Mobile) -->
            <div class="mb-6">
              <h3 class="text-sm font-medium text-gray-900 dark:text-white mb-4">Select File</h3>
              <button
                class="w-full p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-center text-gray-600 dark:text-gray-400 hover:border-blue-400 dark:hover:border-blue-500 transition-colors">
                <svg class="mx-auto h-8 w-8 mb-2" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                </svg>
                <span class="text-sm">Tap to select file</span>
              </button>
            </div>

            <!-- Options (Mobile) -->
            <div class="space-y-4">
              <h3 class="text-sm font-medium text-gray-900 dark:text-white">Options</h3>

              <div class="flex items-center justify-between">
                <label class="text-sm text-gray-700 dark:text-gray-300">Include Abstract</label>
                <div class="toggle-switch">
                  <input type="checkbox" checked>
                  <span class="slider"></span>
                </div>
              </div>

              <div class="flex items-center justify-between">
                <label class="text-sm text-gray-700 dark:text-gray-300">Include Keywords</label>
                <div class="toggle-switch">
                  <input type="checkbox" checked>
                  <span class="slider"></span>
                </div>
              </div>

              <div class="flex items-center justify-between">
                <label class="text-sm text-gray-700 dark:text-gray-300">Include Notes</label>
                <div class="toggle-switch">
                  <input type="checkbox">
                  <span class="slider"></span>
                </div>
              </div>

              <div class="flex items-center justify-between">
                <label class="text-sm text-gray-700 dark:text-gray-300">Preserve Formatting</label>
                <div class="toggle-switch">
                  <input type="checkbox" checked>
                  <span class="slider"></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}
