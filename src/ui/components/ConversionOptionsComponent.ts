/**
 * Conversion Options Component - Handles all conversion settings
 */
export class ConversionOptionsComponent {
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
      <div class="p-6 flex-1 overflow-y-auto">
        <h2 class="text-sm font-medium text-gray-900 dark:text-white mb-4">Conversion Options</h2>

        <div class="space-y-4">
          <!-- Include Abstract -->
          <div class="flex items-center justify-between">
            <label for="includeAbstract" class="text-sm text-gray-700 dark:text-gray-300">Include Abstract</label>
            <div class="toggle-switch">
              <input type="checkbox" id="includeAbstract" checked>
              <span class="slider"></span>
            </div>
          </div>

          <!-- Include Keywords -->
          <div class="flex items-center justify-between">
            <label for="includeKeywords" class="text-sm text-gray-700 dark:text-gray-300">Include Keywords</label>
            <div class="toggle-switch">
              <input type="checkbox" id="includeKeywords" checked>
              <span class="slider"></span>
            </div>
          </div>

          <!-- Include Notes -->
          <div class="flex items-center justify-between">
            <label for="includeNotes" class="text-sm text-gray-700 dark:text-gray-300">Include Notes</label>
            <div class="toggle-switch">
              <input type="checkbox" id="includeNotes">
              <span class="slider"></span>
            </div>
          </div>

          <!-- Preserve Formatting -->
          <div class="flex items-center justify-between">
            <label for="preserveFormatting" class="text-sm text-gray-700 dark:text-gray-300">Preserve Formatting</label>
            <div class="toggle-switch">
              <input type="checkbox" id="preserveFormatting" checked>
              <span class="slider"></span>
            </div>
          </div>

          <!-- Custom Fields -->
          <div>
            <label for="customFields" class="block text-sm text-gray-700 dark:text-gray-300 mb-2">Custom Fields</label>
            <input type="text" id="customFields" placeholder="field1, field2, field3"
              class="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors">
            <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">Comma-separated field names</p>
          </div>

          <!-- Citation Style -->
          <div>
            <label for="citationStyle" class="block text-sm text-gray-700 dark:text-gray-300 mb-2">Citation Style</label>
            <select id="citationStyle"
              class="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors">
              <option value="standard">Standard BibTeX</option>
              <option value="acm">ACM Style</option>
              <option value="biblatex">BibLaTeX Format</option>
              <option value="ieee">IEEE Style</option>
              <option value="apa">APA Style</option>
              <option value="harvard">Harvard Style</option>
              <option value="chicago">Chicago Style</option>
            </select>
            <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">Choose output format style</p>
          </div>

          <!-- Advanced Options -->
          <div class="flex items-center justify-between">
            <label for="escapeLatex" class="text-sm text-gray-700 dark:text-gray-300">Escape LaTeX Characters</label>
            <div class="toggle-switch">
              <input type="checkbox" id="escapeLatex" checked>
              <span class="slider"></span>
            </div>
          </div>

          <div class="flex items-center justify-between">
            <label for="suppressWarnings" class="text-sm text-gray-700 dark:text-gray-300">Suppress Warnings</label>
            <div class="toggle-switch">
              <input type="checkbox" id="suppressWarnings" checked>
              <span class="slider"></span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Get current conversion options from UI
   */
  public getConversionOptions(): any {
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
}
