/**
 * File Upload Component - Handles file selection and display
 */
export class FileUploadComponent {
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
      <div class="p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 class="text-sm font-medium text-gray-900 dark:text-white mb-4">Select File</h2>

        <div class="file-upload-area">
          <input type="file" id="xmlFile" accept=".xml,.ris,.enw,.txt"
            class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" aria-label="Choose file">
          <div class="space-y-3">
            <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
            </svg>
            <div class="text-center">
              <p class="text-sm text-gray-600 dark:text-gray-400">
                <span class="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 cursor-pointer">Click to upload</span>
                or drag and drop
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-500">XML, RIS, or ENW files</p>
            </div>
          </div>
        </div>

        <!-- File Info Display -->
        <div id="fileInfo" class="mt-4 hidden">
          <div class="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <svg class="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd"
                d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                clip-rule="evenodd"></path>
            </svg>
            <div class="flex-1 min-w-0">
              <p id="fileName" class="text-sm font-medium text-gray-900 dark:text-white truncate"></p>
              <p id="fileSize" class="text-xs text-gray-500 dark:text-gray-400"></p>
            </div>
          </div>
        </div>

        <!-- Selected File Details -->
        <div id="selectedFileDetails" class="mt-4 hidden"></div>
      </div>
    `;
  }

  public updateFileDisplay(filename: string, size: number): void {
    const fileInfo = document.getElementById("fileInfo");
    const fileNameElement = document.getElementById("fileName");
    const fileSizeElement = document.getElementById("fileSize");

    if (fileInfo && fileNameElement && fileSizeElement) {
      fileNameElement.textContent = filename;
      fileSizeElement.textContent = this.formatFileSize(size);
      fileInfo.classList.remove("hidden");
    }
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }
}
