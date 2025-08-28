# Development Guidelines

## Code Structure

### File Organization

- `main.js` - Electron main process
- `preload.js` - Security layer between main and renderer
- `index.html` - Application UI structure
- `src/app.js` - Main application logic
- `src/converter/` - Core conversion functionality
- `src/utils/` - Utility modules
- `src/styles/` - CSS stylesheets

### Naming Conventions

- Use camelCase for JavaScript variables and functions
- Use kebab-case for CSS classes and IDs
- Use PascalCase for class names
- Use UPPER_CASE for constants

### Code Style

- Use 2 spaces for indentation
- Use semicolons
- Use single quotes for strings
- Add comments for complex logic
- Keep functions focused and small

## Error Handling

### Principles

1. Always catch and handle errors gracefully
2. Log errors with appropriate detail
3. Provide user-friendly error messages
4. Allow graceful degradation when possible

### Implementation

```javascript
try {
  // Risky operation
  const result = await apiCall();
  return result;
} catch (error) {
  logger.error(`API call failed: ${error.message}`);
  // Fallback or user notification
  showError("Operation failed", error.message);
}
```

## Testing

### Manual Testing Checklist

- [ ] File operations (open, save)
- [ ] XML parsing with various formats
- [ ] Conversion with all options
- [ ] API enhancement functionality
- [ ] Theme switching
- [ ] Settings persistence
- [ ] Error scenarios
- [ ] Large file handling

### Test Data

Use the sample XML files in `reference_dir/test/` for testing.

## Performance

### Best Practices

1. Use async/await for non-blocking operations
2. Implement progress tracking for long operations
3. Allow cancellation of long-running tasks
4. Optimize DOM updates
5. Use efficient algorithms for parsing

### Memory Management

- Clean up event listeners
- Avoid memory leaks in callbacks
- Use WeakMap/WeakSet when appropriate
- Monitor memory usage during development

## Security

### Electron Security

1. Enable context isolation
2. Disable node integration in renderer
3. Use preload scripts for IPC
4. Validate all external input
5. Sanitize HTML content

### API Security

- Never expose API keys in renderer process
- Implement rate limiting
- Validate API responses
- Handle network errors gracefully

## Debugging

### Tools

- Chrome DevTools (built into Electron)
- Console logging with different levels
- File system logging for production
- Network inspection for API calls

### Debug Mode

Enable debug mode in settings for:

- Verbose logging
- Additional error details
- Performance metrics
- API call tracing

## Building and Distribution

### Development

```bash
npm run dev  # Development mode with debugging
```

### Production

```bash
npm run build  # Build for current platform
npm run dist   # Create distribution packages
```

### Platform-Specific Builds

```bash
npm run build-mac    # macOS
npm run build-win    # Windows
npm run build-linux  # Linux
```

## Contributing

### Pull Request Process

1. Create feature branch from main
2. Implement changes with tests
3. Update documentation
4. Submit pull request
5. Address review feedback

### Commit Messages

Use conventional commit format:

- `feat:` new feature
- `fix:` bug fix
- `docs:` documentation
- `style:` formatting
- `refactor:` code restructuring
- `test:` testing
- `chore:` maintenance

Example: `feat: add dark theme support`
