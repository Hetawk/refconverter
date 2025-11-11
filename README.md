# Reference Converter - Electron App

A robust, feature-rich XML to BibTeX reference converter built with Electron. This application provides a modern desktop interface for converting EndNote XML files to BibTeX format with advanced features like external API enhancement, multiple themes, and comprehensive error handling.

## Features

### Core Functionality

- **XML to BibTeX Conversion**: Convert EndNote XML files to BibTeX format
- **Multiple Entry Types**: Support for articles, books, conference papers, theses, and more
- **Field Mapping**: Intelligent mapping of XML fields to BibTeX fields
- **Citation Key Generation**: Automatic generation of unique citation keys

### Advanced Features

- **External API Enhancement**: Integrate with Semantic Scholar and Crossref APIs to enhance reference metadata
- **String Definitions**: Generate organized string definitions for journals and publishers
- **BibLaTeX Support**: Option to use BibLaTeX field names
- **LaTeX Character Escaping**: Automatic escaping of special LaTeX characters
- **Progress Tracking**: Real-time conversion progress with cancellation support

### User Interface

- **Modern Design**: Clean, intuitive interface with tab-based navigation
- **Multiple Themes**: Dark, light, and auto themes with additional color variants
- **Real-time Preview**: Live preview of converted references
- **Comprehensive Logging**: Detailed conversion logs with different severity levels
- **Statistics View**: Detailed statistics about the conversion process

### File Operations

- **Drag & Drop**: Easy file loading (planned)
- **Copy/Paste**: Direct clipboard operations
- **Export Options**: Save BibTeX files and export logs
- **Recent Files**: Quick access to recently opened files (planned)

## Installation

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Development Setup

```bash
# Clone the repository
git clone https://github.com/Hetawk/refconverter.git
cd refconverter

# Install dependencies
npm install

# Start the application in development mode
npm run dev

# Or start normally
npm start
```

### Building for Distribution

#### Development Build

```bash
# Build CSS and TypeScript
npm run build:all

# Test the app
npm start
```

#### Production Builds

**Complete Multi-Platform Build (Recommended):**

```bash
# Build for ALL platforms (macOS, Windows, Linux)
npm run build:production
```

**Build for Specific Platforms:**

```bash
# macOS (Intel + Apple Silicon)
npm run build:mac

# Windows (x64 + ia32)
npm run build:win

# Linux (AppImage + DEB + tar.gz)
npm run build:linux
```

**Clean Build Directory:**

```bash
# Remove previous builds
npm run clean
```

#### Build Output

Built applications will be available in the `dist/` directory:

- **macOS Intel**: `RefConvert Pro - EKD Digital-1.0.0-mac.zip`
- **macOS Apple Silicon**: `RefConvert Pro - EKD Digital-1.0.0-arm64-mac.zip`
- **Windows Installer**: `RefConvert Pro - EKD Digital Setup 1.0.0.exe`
- **Windows Portable**: `RefConvert Pro - EKD Digital 1.0.0.exe`
- **Linux AppImage**: `RefConvert Pro - EKD Digital-1.0.0.AppImage`
- **Linux DEB**: `refconv-electron_1.0.0_amd64.deb`
- **Linux Archive**: `refconv-electron-1.0.0.tar.gz`

#### Development vs Production

- **Development mode** (`npm run dev`): Opens with developer tools enabled
- **Production mode** (`npm start`): Runs without developer tools
- **Built apps**: Optimized for distribution without debug features

## Usage

### Basic Conversion

1. **Load XML File**: Click "Open XML File" or use Ctrl/Cmd+O
2. **Configure Options**: Set conversion preferences in the sidebar
3. **Convert**: Click "Convert to BibTeX" to process the file
4. **Save Output**: Click "Save BibTeX" or use Ctrl/Cmd+S

### Advanced Options

- **API Enhancement**: Enable external API lookups for missing metadata
- **String Definitions**: Generate @string definitions for journals/publishers
- **BibLaTeX Fields**: Use BibLaTeX field names instead of standard BibTeX
- **ACM Style**: Apply ACM-specific formatting rules
- **LaTeX Escaping**: Automatically escape special LaTeX characters

### Keyboard Shortcuts

- `Ctrl/Cmd+O`: Open XML file
- `Ctrl/Cmd+S`: Save BibTeX output
- `Ctrl/Cmd+V`: Paste XML content
- `Ctrl/Cmd+C`: Copy BibTeX output (when output tab is active)

## Configuration

### Settings

Access settings via the gear icon in the header:

#### API Configuration

- **API Timeout**: Timeout for external API calls (5-60 seconds)
- **Rate Limit Delay**: Delay between API calls (0.1-10 seconds)

#### Conversion Settings

- **Debug Mode**: Enable detailed debug logging
- **Suppress Warnings**: Hide non-critical warning messages

### Themes

Choose from multiple themes:

- **Dark**: Default dark theme
- **Light**: Clean light theme
- **Auto**: Follow system preference
- **High Contrast**: Enhanced visibility
- **Blue/Green/Purple**: Themed variants

## API Integration

The application can enhance references using external APIs:

### Supported APIs

- **Semantic Scholar**: Academic paper database
- **Crossref**: DOI and metadata service

### API Features

- Automatic metadata completion
- DOI lookup and validation
- Citation count information
- Abstract enhancement
- Rate limiting and error handling

## Architecture

### Project Structure

```
refconverter/
├── main.js                 # Electron main process
├── preload.js             # Preload script for security
├── index.html             # Main application window
├── src/                   # TypeScript source files
│   ├── app.ts            # Main application logic
│   ├── converter/
│   │   ├── ConversionEngine.ts    # Core XML to BibTeX converter
│   │   └── externalApiManager.js  # API integration
│   ├── handlers/
│   │   └── ResponseHandler.ts     # Response handling
│   ├── ui/
│   │   ├── components/            # UI components
│   │   ├── ToastManager.ts       # Toast notifications
│   │   └── UIController.ts       # UI controller
│   └── utils/
│       ├── EventManager.ts       # Event management
│       ├── FileManager.ts        # File operations
│       ├── Logger.ts             # Logging system
│       ├── ProgressManager.ts    # Progress tracking
│       └── SettingsManager.ts    # Settings management
├── dist/                  # Compiled output
│   ├── styles/            # Compiled CSS
│   └── ...                # Compiled TypeScript
├── assets/               # Icons and images
│   └── logo.png          # Application icon
├── package.json          # Project configuration
├── tsconfig.json         # TypeScript configuration
└── tailwind.config.js    # Tailwind CSS configuration
```

### Key Components

#### ConversionEngine

Core conversion engine that handles:

- XML parsing and validation
- Field extraction and mapping
- BibTeX entry generation
- Error handling and reporting

#### ExternalAPIManager

API integration layer providing:

- Rate-limited API calls
- Multiple provider support
- Fallback mechanisms
- Response caching (planned)

#### Logger

Centralized logging system with:

- Multiple severity levels
- Real-time UI updates
- Export capabilities
- Configurable filtering

#### SettingsManager

Configuration management with:

- Persistent storage
- Validation
- Live updates
- Import/export (planned)

## Error Handling

The application provides robust error handling:

### Validation

- XML structure validation
- Field presence checking
- Data type validation
- Character encoding detection

### Recovery

- Graceful degradation on API failures
- Partial conversion on errors
- Detailed error reporting
- User-friendly error messages

### Logging

- Comprehensive error logging
- Stack trace capture
- Context information
- Export for debugging

## Performance

### Optimization Features

- Streaming XML processing for large files
- Background conversion with progress tracking
- Memory-efficient processing
- Cancellable operations

### Scalability

- Handles files with thousands of references
- Efficient string definitions generation
- Optimized UI updates
- Memory leak prevention

## Contributing

### Development Guidelines

1. Follow the existing code structure
2. Add comprehensive error handling
3. Include logging for debugging
4. Test with various XML formats
5. Update documentation

### Testing

- Test with sample EndNote XML files
- Verify all conversion options
- Test API integration
- Check theme switching
- Validate file operations

## License

MIT License - see LICENSE file for details.

## Support

For issues, questions, or contributions:

1. Check the conversion log for detailed error information
2. Verify XML file format compatibility
3. Test with API enhancement disabled
4. Review settings configuration

## Deployment & Auto-Updates

### Automatic Updates

The application includes built-in auto-update functionality that checks for new versions from GitHub releases.

#### Update Process

1. **Automatic Check**: The app checks for updates on startup (production builds only)
2. **Background Download**: Updates download in the background without interrupting work
3. **User Notification**: Users are notified when updates are available and when ready to install
4. **Install on Restart**: Updates are applied when the application is restarted

#### Manual Update Check

Users can manually check for updates through the application menu:

- **macOS**: Application Menu → Check for Updates
- **Windows/Linux**: Help Menu → Check for Updates

### GitHub Release Process

#### Creating a New Release

1. **Update Version**: Update the version in `package.json`

   ```bash
   npm version patch  # for bug fixes
   npm version minor  # for new features
   npm version major  # for breaking changes
   ```

2. **Create Git Tag**: Push the version tag to trigger the build

   ```bash
   git push origin master
   git push origin --tags
   ```

3. **Automatic Build**: GitHub Actions will automatically:
   - Build for macOS, Windows, and Linux
   - Create a GitHub release
   - Upload all platform binaries
   - Generate release notes

#### Manual Release Commands

For local builds and releases:

```bash
# Build and release all platforms
npm run release

# Build draft release (won't publish until tag is created)
npm run draft-release

# Build specific platforms for release
npm run build:mac && npx electron-builder --publish=always
npm run build:win && npx electron-builder --publish=always
npm run build:linux && npx electron-builder --publish=always
```

### GitHub Repository Setup

#### Required Configuration

1. **Update Repository Info**: In `package.json`, update the GitHub repository info:

   ```json
   "build": {
     "publish": [
       {
         "provider": "github",
         "owner": "Hetawk",
         "repo": "refconverter"
       }
     ]
   }
   ```

2. **GitHub Token**: For automated releases, set up a GitHub token:
   - Go to GitHub Settings → Developer settings → Personal access tokens
   - Create a token with `repo` permissions
   - Add as `GH_TOKEN` environment variable or repository secret

#### Workflow Setup

The `.github/workflows/build-and-release.yml` file handles:

- **Automatic builds** on version tags
- **Multi-platform compilation** (macOS, Windows, Linux)
- **GitHub release creation** with all platform binaries
- **Artifact upload** for manual downloads

**📘 For detailed instructions on using GitHub Actions, testing workflows, and troubleshooting, see [GITHUB_ACTIONS_GUIDE.md](GITHUB_ACTIONS_GUIDE.md).**

### Distribution

#### Download Options

Users can download the latest version from:

- **GitHub Releases**: Direct download of platform-specific installers
- **Auto-updater**: Automatic updates within the application
- **Website**: Custom download page (if configured)

#### Platform-Specific Notes

- **macOS**: `.zip` archives for both Intel and Apple Silicon Macs
- **Windows**: `.exe` installer with NSIS, includes uninstaller and portable version
- **Linux**: `.AppImage` (portable), `.deb` (Debian/Ubuntu), and `.tar.gz` (manual installation)

## Roadmap

### Planned Features

- Batch file processing
- Custom field mapping
- Plugin system for extensions
- Cloud storage integration
- Reference validation
- Export to other formats (RIS, EndNote)
- Advanced search and filtering
- Reference deduplication

### Performance Improvements

- Web Workers for conversion
- Streaming for large files
- Background processing
- Caching mechanisms

---

_Built with Electron, providing a modern desktop experience for academic reference management._
