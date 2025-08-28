# Development & Build Guide - RefConvert Pro

## 🚀 Development Setup

### Prerequisites

- **Node.js 18+**
- **npm** (comes with Node.js)
- **Git**

### Initial Setup

```bash
# Clone the repository
git clone https://github.com/Hetawk/refconverter.git
cd refconverter

# Install dependencies
npm install

# Build and run in development mode
npm run dev
```

## 🔧 Development Commands

### Daily Development

```bash
# Development mode (with DevTools)
npm run dev

# Production mode (no DevTools)
npm start

# Watch mode (auto-rebuild on changes)
npm run watch
```

### Building Assets

```bash
# Build CSS and TypeScript
npm run build:all

# Build just CSS
npm run build:css

# Build just TypeScript
npm run build:ts

# Watch CSS for changes
npm run build:css:watch

# Watch TypeScript for changes
npm run build:ts:watch
```

## 📦 Building Distributables

### Platform-Specific Builds

```bash
# macOS (Intel x64 + Apple Silicon arm64)
npm run build:mac

# Windows (x64 + ia32 + portable)
npm run build:win

# Linux (AppImage + deb + rpm + tar.gz)
npm run build:linux

# All platforms
npm run build:all-platforms
```

### Build Outputs

All builds go to the `dist/` directory:

#### macOS

- `RefConvert Pro - EKD Digital-1.0.0.dmg` (Intel)
- `RefConvert Pro - EKD Digital-1.0.0-arm64.dmg` (Apple Silicon)
- ZIP versions for distribution

#### Windows

- `RefConvert Pro - EKD Digital Setup 1.0.0.exe` (x64 installer)
- `RefConvert Pro - EKD Digital Setup 1.0.0-ia32.exe` (32-bit installer)
- `RefConvert Pro - EKD Digital 1.0.0.exe` (portable)

#### Linux

- `RefConvert Pro - EKD Digital-1.0.0.AppImage` (universal)
- `refconv-electron_1.0.0_amd64.deb` (Debian/Ubuntu)
- `refconv-electron-1.0.0.x86_64.rpm` (RedHat/SUSE)
- `refconv-electron-1.0.0.tar.gz` (generic)

## 🧹 Cleanup Commands

```bash
# Clean all build artifacts
npm run clean

# Clean just compiled TypeScript/CSS
npm run clean:dist

# Clean just Electron build outputs
npm run clean:electron
```

## 🚀 Release Process

### Automated Release (Recommended)

```bash
# Patch release (1.0.0 → 1.0.1)
./scripts/release.sh patch

# Minor release (1.0.0 → 1.1.0)
./scripts/release.sh minor

# Major release (1.0.0 → 2.0.0)
./scripts/release.sh major
```

### Manual Release

```bash
# Update version
npm version patch

# Build and release
npm run release

# Or build specific platform and release
npm run build:mac && npx electron-builder --publish=always
```

## 🔄 Auto-Update System

### How It Works

1. **Check on Startup**: App checks GitHub releases for updates
2. **Background Download**: New versions download automatically
3. **User Notification**: Non-intrusive notifications about updates
4. **Install on Restart**: Users choose when to restart and install

### Configuration

- **Repository**: `https://github.com/Hetawk/refconverter`
- **Update Channel**: GitHub Releases
- **Auto-check**: Production builds only (not development)

## 📁 Project Structure

```
refconverter/
├── src/                    # TypeScript source code
│   ├── app.ts             # Main application logic
│   ├── converter/         # Conversion engine
│   ├── ui/                # UI components
│   └── utils/             # Utility modules
├── dist/                   # Build outputs
│   ├── *.js               # Compiled TypeScript
│   ├── *.css              # Compiled CSS
│   └── *.dmg, *.exe, etc. # Platform distributables
├── assets/                 # Static assets
│   ├── logo.png           # Company logo
│   └── *.ico, *.png       # Platform icons
├── build/                  # Build resources
│   └── icon.png           # App icon for builds
├── reference_dir/          # Python conversion backend
├── .github/workflows/      # GitHub Actions CI/CD
├── scripts/               # Build and release scripts
└── main.js                # Electron main process
```

## ⚡ Development Best Practices

### Code Style

- **TypeScript**: Strict mode enabled
- **CSS**: Tailwind utility-first approach
- **Modules**: ES2020 modules with `.js` imports

### Git Workflow

- **Main Branch**: `main` (production-ready code)
- **Feature Branches**: `feature/description`
- **Release Tags**: `v1.0.0`, `v1.1.0`, etc.
- **Commits**: Conventional commit format

### Build Optimization

- **Pre-build**: Automatic cleanup of previous builds
- **Incremental**: Only rebuild changed files during development
- **Tree Shaking**: Unused code eliminated in production builds
- **Compression**: Automatic asset compression

## 🔍 Troubleshooting

### Build Issues

```bash
# Clear all caches and rebuild
npm run clean
rm -rf node_modules
npm install
npm run build:all
```

### Development Issues

```bash
# Reset development environment
npm run clean:dist
npm run build:all
npm run dev
```

### Release Issues

- Check GitHub token permissions
- Verify repository URL in package.json
- Ensure git working directory is clean
- Confirm version number follows semver

## 📊 Build Performance

### Typical Build Times

- **Development build**: 2-5 seconds
- **Single platform**: 2-5 minutes
- **All platforms**: 10-15 minutes
- **CI/CD pipeline**: 15-20 minutes

### Optimization Tips

- Use `npm run build:mac` for local testing (fastest)
- Use GitHub Actions for multi-platform releases
- Keep `node_modules` cached for faster CI builds

---

**Company**: EKD Digital  
**Website**: https://www.ekddigital.com/  
**Repository**: https://github.com/Hetawk/refconverter
