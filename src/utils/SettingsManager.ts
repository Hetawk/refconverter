/**
 * Settings Manager - TypeScript version with validation and persistence
 * Handles all application settings with type safety and validation
 */

export interface ConversionSettings {
  enableApiEnhancement: boolean;
  useStringDefinitions: boolean;
  useBiblatexFields: boolean;
  useAcmStyle: boolean;
  escapeLatexChars: boolean;
  debugMode: boolean;
  suppressWarnings: boolean;
  extractStyledText: boolean;
  citationStyle: string;
}

export interface ApiSettings {
  timeout: number;
  rateLimitDelay: number;
  retryAttempts: number;
  baseUrl?: string;
}

export interface UiSettings {
  theme: "light" | "dark" | "auto";
  fontSize: number;
  autoSave: boolean;
  showLineNumbers: boolean;
  compactMode: boolean;
  showTooltips: boolean;
}

export interface FileSettings {
  defaultFileExtension: string;
  backupFiles: boolean;
  maxRecentFiles: number;
  autoCleanup: boolean;
  downloadPath?: string;
}

export interface AppSettings {
  conversion: ConversionSettings;
  api: ApiSettings;
  ui: UiSettings;
  files: FileSettings;
}

export interface SettingsListener {
  (key: string, newValue: any, oldValue: any): void;
}

export class SettingsManager {
  private static instance: SettingsManager;
  private settings: AppSettings;
  private listeners: SettingsListener[] = [];
  private readonly storageKey = "refconv-settings";

  private readonly defaultSettings: AppSettings = {
    conversion: {
      enableApiEnhancement: false,
      useStringDefinitions: true,
      useBiblatexFields: false,
      useAcmStyle: false,
      escapeLatexChars: true,
      debugMode: false,
      suppressWarnings: false,
      extractStyledText: true,
      citationStyle: "standard",
    },
    api: {
      timeout: 10000,
      rateLimitDelay: 1000,
      retryAttempts: 3,
    },
    ui: {
      theme: "auto",
      fontSize: 14,
      autoSave: true,
      showLineNumbers: false,
      compactMode: false,
      showTooltips: true,
    },
    files: {
      defaultFileExtension: ".bib",
      backupFiles: true,
      maxRecentFiles: 10,
      autoCleanup: true,
    },
  };

  private constructor() {
    this.settings = this.loadSettings();
    console.log("⚙️ SettingsManager initialized");
  }

  static getInstance(): SettingsManager {
    if (!SettingsManager.instance) {
      SettingsManager.instance = new SettingsManager();
    }
    return SettingsManager.instance;
  }

  /**
   * Get a setting value by path (e.g., 'ui.theme' or 'conversion.escapeLatexChars')
   */
  get<T = any>(path: string): T {
    return this.getNestedValue(this.settings, path);
  }

  /**
   * Set a setting value by path
   */
  set(path: string, value: any): void {
    const oldValue = this.get(path);

    if (this.validateSetting(path, value)) {
      this.setNestedValue(this.settings, path, value);
      this.saveSettings();
      this.notifyListeners(path, value, oldValue);
    } else {
      throw new Error(`Invalid value for setting '${path}': ${value}`);
    }
  }

  /**
   * Get all settings
   */
  getAll(): AppSettings {
    return JSON.parse(JSON.stringify(this.settings)); // Deep clone
  }

  /**
   * Set multiple settings at once
   */
  setMultiple(updates: Partial<AppSettings>): void {
    Object.entries(updates).forEach(([section, sectionSettings]) => {
      if (sectionSettings && typeof sectionSettings === "object") {
        Object.entries(sectionSettings).forEach(([key, value]) => {
          this.set(`${section}.${key}`, value);
        });
      }
    });
  }

  /**
   * Reset settings to defaults
   */
  reset(): void {
    const oldSettings = this.getAll();
    this.settings = JSON.parse(JSON.stringify(this.defaultSettings));
    this.saveSettings();

    // Notify listeners of all changes
    this.notifyAllChanges(oldSettings, this.settings);
  }

  /**
   * Reset a specific section to defaults
   */
  resetSection(section: keyof AppSettings): void {
    const oldSettings = this.getAll();
    this.settings[section] = JSON.parse(
      JSON.stringify(this.defaultSettings[section])
    );
    this.saveSettings();

    // Notify listeners of section changes
    Object.keys(this.defaultSettings[section]).forEach((key) => {
      const path = `${section}.${key}`;
      const newValue = this.get(path);
      const oldValue = this.getNestedValue(oldSettings, path);
      this.notifyListeners(path, newValue, oldValue);
    });
  }

  /**
   * Add a settings change listener
   */
  addListener(listener: SettingsListener): void {
    this.listeners.push(listener);
  }

  /**
   * Remove a settings change listener
   */
  removeListener(listener: SettingsListener): void {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  /**
   * Export settings as JSON
   */
  exportSettings(): string {
    return JSON.stringify(this.settings, null, 2);
  }

  /**
   * Import settings from JSON
   */
  importSettings(jsonString: string): void {
    try {
      const importedSettings = JSON.parse(jsonString);
      if (this.validateSettings(importedSettings)) {
        const oldSettings = this.getAll();
        this.settings = { ...this.defaultSettings, ...importedSettings };
        this.saveSettings();
        this.notifyAllChanges(oldSettings, this.settings);
      } else {
        throw new Error("Invalid settings format");
      }
    } catch (error) {
      throw new Error(`Failed to import settings: ${error}`);
    }
  }

  /**
   * Get settings schema for validation
   */
  getSchema(): any {
    return {
      conversion: {
        enableApiEnhancement: "boolean",
        useStringDefinitions: "boolean",
        useBiblatexFields: "boolean",
        useAcmStyle: "boolean",
        escapeLatexChars: "boolean",
        debugMode: "boolean",
        suppressWarnings: "boolean",
        extractStyledText: "boolean",
        citationStyle: [
          "standard",
          "acm",
          "ieee",
          "apa",
          "harvard",
          "chicago",
          "biblatex",
        ],
      },
      api: {
        timeout: "number",
        rateLimitDelay: "number",
        retryAttempts: "number",
        baseUrl: "string?",
      },
      ui: {
        theme: ["light", "dark", "auto"],
        fontSize: "number",
        autoSave: "boolean",
        showLineNumbers: "boolean",
        compactMode: "boolean",
        showTooltips: "boolean",
      },
      files: {
        defaultFileExtension: "string",
        backupFiles: "boolean",
        maxRecentFiles: "number",
        autoCleanup: "boolean",
        downloadPath: "string?",
      },
    };
  }

  /**
   * Load settings from localStorage
   */
  private loadSettings(): AppSettings {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsedSettings = JSON.parse(stored);
        // Merge with defaults to handle new settings
        return this.deepMerge(this.defaultSettings, parsedSettings);
      }
    } catch (error) {
      console.warn("Failed to load settings from localStorage:", error);
    }
    return JSON.parse(JSON.stringify(this.defaultSettings));
  }

  /**
   * Save settings to localStorage
   */
  private saveSettings(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.settings));
    } catch (error) {
      console.error("Failed to save settings to localStorage:", error);
    }
  }

  /**
   * Validate a single setting
   */
  private validateSetting(path: string, value: any): boolean {
    const schema = this.getSchema();
    const schemaValue = this.getNestedValue(schema, path);

    if (!schemaValue) return false;

    if (typeof schemaValue === "string") {
      if (schemaValue.endsWith("?")) {
        // Optional field
        const baseType = schemaValue.slice(0, -1);
        return (
          value === undefined || value === null || typeof value === baseType
        );
      }
      return typeof value === schemaValue;
    }

    if (Array.isArray(schemaValue)) {
      return schemaValue.includes(value);
    }

    if (schemaValue === "number") {
      return typeof value === "number" && !isNaN(value);
    }

    return false;
  }

  /**
   * Validate entire settings object
   */
  private validateSettings(settings: any): boolean {
    try {
      const schema = this.getSchema();
      return this.validateObjectAgainstSchema(settings, schema);
    } catch {
      return false;
    }
  }

  /**
   * Validate object against schema recursively
   */
  private validateObjectAgainstSchema(obj: any, schema: any): boolean {
    for (const key in schema) {
      if (obj[key] === undefined) continue;

      const schemaValue = schema[key];
      const objValue = obj[key];

      if (typeof schemaValue === "object" && !Array.isArray(schemaValue)) {
        if (!this.validateObjectAgainstSchema(objValue, schemaValue)) {
          return false;
        }
      } else {
        if (!this.validateSetting(key, objValue)) {
          return false;
        }
      }
    }
    return true;
  }

  /**
   * Get nested value from object using dot notation
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split(".").reduce((current, key) => current?.[key], obj);
  }

  /**
   * Set nested value in object using dot notation
   */
  private setNestedValue(obj: any, path: string, value: any): void {
    const keys = path.split(".");
    const lastKey = keys.pop()!;
    const target = keys.reduce((current, key) => current[key], obj);
    target[lastKey] = value;
  }

  /**
   * Deep merge two objects
   */
  private deepMerge(target: any, source: any): any {
    const result = { ...target };

    for (const key in source) {
      if (
        source[key] &&
        typeof source[key] === "object" &&
        !Array.isArray(source[key])
      ) {
        result[key] = this.deepMerge(target[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }

    return result;
  }

  /**
   * Notify listeners of setting change
   */
  private notifyListeners(path: string, newValue: any, oldValue: any): void {
    this.listeners.forEach((listener) => {
      try {
        listener(path, newValue, oldValue);
      } catch (error) {
        console.error("Settings listener error:", error);
      }
    });
  }

  /**
   * Notify listeners of all changes between two settings objects
   */
  private notifyAllChanges(
    oldSettings: AppSettings,
    newSettings: AppSettings
  ): void {
    const flattenObject = (obj: any, prefix = ""): Record<string, any> => {
      const result: Record<string, any> = {};
      for (const key in obj) {
        const newKey = prefix ? `${prefix}.${key}` : key;
        if (
          obj[key] &&
          typeof obj[key] === "object" &&
          !Array.isArray(obj[key])
        ) {
          Object.assign(result, flattenObject(obj[key], newKey));
        } else {
          result[newKey] = obj[key];
        }
      }
      return result;
    };

    const oldFlat = flattenObject(oldSettings);
    const newFlat = flattenObject(newSettings);

    for (const path in newFlat) {
      if (oldFlat[path] !== newFlat[path]) {
        this.notifyListeners(path, newFlat[path], oldFlat[path]);
      }
    }
  }
}
