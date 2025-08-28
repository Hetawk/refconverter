/**
 * File management utilities for reading and saving files
 */
export class FileManager {
  constructor() {
    console.log("📁 FileManager initialized");
  }

  /**
   * Read a file as text content
   */
  async readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        const content = event.target?.result as string;
        resolve(content);
      };

      reader.onerror = () => {
        reject(new Error("Failed to read file"));
      };

      reader.readAsText(file);
    });
  }

  /**
   * Save content to a file using browser download
   */
  async saveToFile(content: string, filename: string): Promise<void> {
    try {
      // Create blob with BOM for better text editor compatibility
      const bom = "\uFEFF";
      const blob = new Blob([bom + content], {
        type: "text/plain;charset=utf-8",
      });

      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;

      // Trigger download
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Clean up
      URL.revokeObjectURL(url);

      console.log(`💾 File saved: ${filename}`);
    } catch (error) {
      console.error("Save failed:", error);
      throw new Error("Failed to save file");
    }
  }

  /**
   * Validate file type and size
   */
  validateFile(file: File): { valid: boolean; error?: string } {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      "text/xml",
      "application/xml",
      "text/plain",
      "application/x-endnote-refer",
      "application/x-research-info-systems",
    ];

    if (file.size > maxSize) {
      return {
        valid: false,
        error: "File size exceeds 10MB limit",
      };
    }

    // Check file extension if MIME type isn't recognized
    const extension = file.name.toLowerCase().split(".").pop();
    const allowedExtensions = ["xml", "ris", "enw", "txt", "bib"];

    if (
      !allowedTypes.includes(file.type) &&
      !allowedExtensions.includes(extension || "")
    ) {
      return {
        valid: false,
        error: "File type not supported. Please use XML, RIS, or ENW files.",
      };
    }

    return { valid: true };
  }

  /**
   * Get file info for display
   */
  getFileInfo(file: File): { name: string; size: string; type: string } {
    return {
      name: file.name,
      size: this.formatFileSize(file.size),
      type: file.type || "Unknown",
    };
  }

  /**
   * Format file size for human reading
   */
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  /**
   * Generate timestamp-based filename
   */
  generateTimestampFilename(extension: string = "bib"): string {
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, "-").slice(0, -5);
    return `references-${timestamp}.${extension}`;
  }
}
