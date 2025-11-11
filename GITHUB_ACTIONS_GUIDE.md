# GitHub Actions CI/CD Guide

## Overview

This repository uses GitHub Actions to automatically build and release the RefConvert Electron application for multiple platforms (macOS, Windows, and Linux). The workflow ensures that executables are built consistently and made available for download through GitHub Releases.

## Workflow: Build and Release

**Location**: `.github/workflows/build-and-release.yml`

### Triggers

The workflow is triggered by:

1. **Tag Push**: Automatically runs when a tag matching `v*.*.*` is pushed (e.g., `v1.0.0`, `v1.2.3`)
2. **Manual Dispatch**: Can be manually triggered from the GitHub Actions tab

### Jobs

#### 1. Build Job

Runs on all three platforms simultaneously using a matrix strategy:
- `macos-latest` - Builds macOS executables (Intel x64 and Apple Silicon arm64)
- `windows-latest` - Builds Windows executables (x64 and ia32 installers, plus portable)
- `ubuntu-latest` - Builds Linux executables (AppImage, deb, tar.gz)

**Steps**:
1. Checkout repository
2. Setup Node.js v18 with npm caching
3. Install dependencies (`npm ci`)
4. Build application assets (`npm run build:all` - compiles TypeScript and Tailwind CSS)
5. Build platform-specific Electron app with `--publish=never` flag
6. Upload artifacts to GitHub (retained for 7 days)
7. List built files for verification

**Important Notes**:
- The `--publish=never` flag prevents electron-builder from attempting to publish during the build phase
- Code signing is disabled for macOS (`CSC_IDENTITY_AUTO_DISCOVERY: false`) - enable if you have certificates
- Each platform build is independent and can succeed/fail separately

#### 2. Release Job

Runs only when triggered by a tag push (`refs/tags/v*.*.*`).

**Steps**:
1. Checkout repository
2. Download all artifacts from the build job
3. Create GitHub Release with:
   - Distributable files only (no build artifacts)
   - Auto-generated release notes
   - Latest update metadata files (*.yml) for electron-updater

**Released Files**:
- macOS: `*.zip`, `*.dmg`, `latest-mac.yml`
- Windows: `*.exe`, `*.msi`, `latest.yml`
- Linux: `*.AppImage`, `*.deb`, `*.tar.gz`, `*.rpm`, `latest-linux.yml`

## Testing the Workflow

### Option 1: Manual Test Without Release

Use this to verify the build process works without creating a release.

1. Navigate to the **Actions** tab in GitHub
2. Select **Build and Release** workflow
3. Click **Run workflow** button
4. Select the branch to test (e.g., `master` or your feature branch)
5. Click **Run workflow**

**What happens**:
- All three platform builds will execute
- Artifacts will be uploaded and available for download
- **No release will be created** (because there's no tag)
- You can download and test the artifacts manually

**Download Artifacts**:
1. Click on the workflow run
2. Scroll down to the **Artifacts** section
3. Download `dist-macos-latest`, `dist-windows-latest`, or `dist-ubuntu-latest`
4. Extract and test the executables

### Option 2: Full Release Test with Tag

Use this to create an actual release with all executables.

#### Preparation

1. **Update Version** (optional):
   ```bash
   # Using npm version command (updates package.json and creates git tag)
   npm version patch   # for bug fixes (1.0.0 -> 1.0.1)
   npm version minor   # for new features (1.0.0 -> 1.1.0)
   npm version major   # for breaking changes (1.0.0 -> 2.0.0)
   ```

2. **Create and Push Tag**:
   ```bash
   # If you used npm version, just push:
   git push origin master
   git push origin --tags

   # Or manually create a tag:
   git tag v1.0.0
   git push origin v1.0.0
   ```

#### What Happens

1. Tag push triggers the workflow automatically
2. Build job runs for all three platforms
3. Artifacts are uploaded
4. Release job creates a GitHub Release
5. All distributable files are attached to the release
6. Release notes are auto-generated from commits

#### Verify Release

1. Go to **Releases** section in GitHub
2. Find your tagged release (e.g., `v1.0.0`)
3. Verify all expected files are present:
   - 2 macOS .zip files (x64 and arm64)
   - Multiple Windows .exe files (installers and portable)
   - Linux .AppImage, .deb, and .tar.gz files
   - Update metadata files (latest*.yml)
4. Download and test executables on each platform

## Expected Build Outputs

### macOS Builds
- `RefConvert Pro - EKD Digital-{version}-mac.zip` (Intel x64)
- `RefConvert Pro - EKD Digital-{version}-arm64-mac.zip` (Apple Silicon)
- `latest-mac.yml` (auto-update metadata)

**Size**: ~120-130 MB per file

### Windows Builds
- `RefConvert Pro - EKD Digital Setup {version}.exe` (x64 installer)
- `RefConvert Pro - EKD Digital Setup {version}-ia32.exe` (32-bit installer)
- `RefConvert Pro - EKD Digital {version}.exe` (x64 portable)
- `latest.yml` (auto-update metadata)

**Size**: ~90-110 MB per file

### Linux Builds
- `RefConvert Pro - EKD Digital-{version}.AppImage` (portable, any distro)
- `refconv-electron_{version}_amd64.deb` (Debian/Ubuntu)
- `refconv-electron-{version}.tar.gz` (manual installation)
- `latest-linux.yml` (auto-update metadata)

**Sizes**: 
- AppImage: ~115 MB
- deb: ~79 MB
- tar.gz: ~109 MB

## Troubleshooting

### Build Fails on Specific Platform

**Solution**: 
- Check the logs for that platform's build job
- Common issues:
  - Dependency installation failures
  - TypeScript compilation errors
  - electron-builder configuration issues
- Test the build locally for that platform if possible

### Release Not Created

**Possible Causes**:
- Workflow was triggered manually (not by a tag)
- Tag doesn't match the pattern `v*.*.*`
- Build job failed on one or more platforms

**Solution**:
- Verify the tag format: `git tag -l`
- Check if all build jobs succeeded
- Review the release job logs

### Missing Files in Release

**Solution**:
- Check the build job artifacts to see if files were created
- Verify the file patterns in the workflow match the actual filenames
- Review electron-builder configuration in `package.json`

### Auto-Update Not Working

**Solution**:
- Ensure `latest*.yml` files are present in the release
- Verify the repository information in `package.json` matches your GitHub repo
- Check electron-updater configuration in the app
- Ensure releases are public (auto-update doesn't work with private repos without authentication)

## Workflow Maintenance

### Updating Node.js Version

Edit `.github/workflows/build-and-release.yml`:
```yaml
- name: Install Node.js
  uses: actions/setup-node@v4
  with:
    node-version: "18"  # Change this version
```

### Updating Electron Builder Targets

Edit `package.json` under the `build` section to add/remove build targets for each platform.

### Adding New Platforms

Add new OS to the matrix in the workflow:
```yaml
strategy:
  matrix:
    os: [macos-latest, windows-latest, ubuntu-latest, macos-13]  # Add here
```

### Enabling Code Signing

#### macOS
1. Add certificates to GitHub Secrets
2. Remove or modify `CSC_IDENTITY_AUTO_DISCOVERY: false`
3. Add required signing secrets

#### Windows
1. Add code signing certificate to GitHub Secrets
2. Configure electron-builder with certificate information

## Best Practices

### Version Management

1. Always update `package.json` version before creating a release tag
2. Use semantic versioning (MAJOR.MINOR.PATCH)
3. Tag format must be `v{version}` (e.g., `v1.0.0`)

### Testing

1. Test workflow manually before creating tagged releases
2. Download and test artifacts on each target platform
3. Verify auto-update functionality after each release

### Security

1. Never commit signing certificates or secrets
2. Use GitHub Secrets for sensitive information
3. Review dependency security alerts regularly
4. Keep GitHub Actions and dependencies updated

### Release Notes

1. Write clear commit messages (used for auto-generated release notes)
2. Optionally edit release notes after creation for clarity
3. Include changelog information in release descriptions

## Monitoring

### Check Workflow Status

- **Actions Tab**: View all workflow runs and their status
- **Badges**: Add workflow status badges to README.md
- **Notifications**: Configure GitHub notifications for workflow failures

### Download Statistics

- View download counts in the Releases section
- Use GitHub API to track download statistics
- Monitor which platforms are most popular

## Additional Resources

- [Electron Builder Documentation](https://www.electron.build/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [electron-updater Documentation](https://www.electron.build/auto-update)
- [Semantic Versioning](https://semver.org/)

## Summary

The GitHub Actions workflow is now configured to:
- ✅ Build executables for macOS (Intel + Apple Silicon), Windows (x64 + ia32), and Linux
- ✅ Create distributable packages (.zip, .exe, .AppImage, .deb, .tar.gz)
- ✅ Upload artifacts for testing (7-day retention)
- ✅ Create GitHub Releases with all executables when tags are pushed
- ✅ Include auto-update metadata files for electron-updater
- ✅ Support both manual testing and automatic release workflows

The automation is fully functional and ready to use!
