#!/bin/bash

# Release script for RefConvert Pro
# Usage: ./release.sh [patch|minor|major]

set -e

# Default to patch if no argument provided
VERSION_TYPE=${1:-patch}

echo "🚀 Starting release process..."

# Ensure we're on main branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "❌ Please switch to main branch before releasing"
    exit 1
fi

# Ensure working directory is clean
if [ -n "$(git status --porcelain)" ]; then
    echo "❌ Working directory is not clean. Please commit or stash changes."
    exit 1
fi

# Pull latest changes
echo "📥 Pulling latest changes..."
git pull origin main

# Update version
echo "📝 Updating version ($VERSION_TYPE)..."
npm version $VERSION_TYPE --no-git-tag-version

# Get new version
NEW_VERSION=$(node -p "require('./package.json').version")
echo "✨ New version: $NEW_VERSION"

# Build and test
echo "🔨 Building application..."
npm run build:all

# Commit version change
echo "💾 Committing version change..."
git add package.json
git commit -m "Release v$NEW_VERSION"

# Create and push tag
echo "🏷️  Creating tag..."
git tag "v$NEW_VERSION"

echo "📤 Pushing changes and tag..."
git push origin main
git push origin "v$NEW_VERSION"

echo "✅ Release v$NEW_VERSION initiated!"
echo "🤖 GitHub Actions will now build and create the release automatically."
echo "📦 Check https://github.com/Hetawk/refconverter/actions for build progress."

# Optional: Open releases page
if command -v open >/dev/null 2>&1; then
    echo "🌐 Opening releases page..."
    open "https://github.com/Hetawk/refconverter/releases"
elif command -v xdg-open >/dev/null 2>&1; then
    echo "🌐 Opening releases page..."
    xdg-open "https://github.com/Hetawk/refconverter/releases"
fi
