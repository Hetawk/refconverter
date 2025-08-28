/**
 * Log Tab Component - Handles the conversion log display
 */
export class LogTabComponent {
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
      <div id="logTabContent" class="tab-content hidden">
        <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">Conversion Log</h3>
            <button id="clearLogBtn" class="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
              Clear Log
            </button>
          </div>
          <div id="conversionLogContent" class="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 h-96 overflow-y-auto font-mono text-sm">
            <div class="text-gray-500 dark:text-gray-400 text-center py-8">
              No conversion activities yet. Start by selecting a file and converting it.
            </div>
          </div>
        </div>
      </div>
    `;
  }

  public updateLog(logEntries: string[]): void {
    const logContainer = document.getElementById("conversionLogContent");
    if (logContainer) {
      logContainer.innerHTML = logEntries
        .slice(-100) // Keep only last 100 entries
        .map((entry) => {
          const level = entry.match(/\[(.*?)\] (\w+):/);
          const levelClass = level ? this.getLogLevelClass(level[2]) : "";
          return `<div class="log-entry ${levelClass}">${entry}</div>`;
        })
        .join("");

      // Scroll to bottom
      logContainer.scrollTop = logContainer.scrollHeight;
    }
  }

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

  public clearLog(): void {
    const logContainer = document.getElementById("conversionLogContent");
    if (logContainer) {
      logContainer.innerHTML = `
        <div class="text-gray-500 dark:text-gray-400 text-center py-8">
          No conversion activities yet. Start by selecting a file and converting it.
        </div>
      `;
    }
  }
}
