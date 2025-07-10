# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a browser extension called "FACE" that adds a movable face image to web pages. The face follows the mouse cursor and can be toggled between moving and static modes.

## Key Architecture

### Extension Structure

- **Content Script** (`src/content-scripts/face.js`): Injected into all web pages to display and control the face image
- **Popup Interface** (`src/popup/settings.html|js|css`): Settings panel for users to configure the extension
- **Message Passing**: Communication between popup and content scripts using browser.runtime.onMessage
- **Build System**: Vite with vite-plugin-web-extension for modern development workflow

### Core Functionality
1. Face image follows mouse cursor when in "moving" mode
2. Click face to toggle between moving/static modes
3. Settings allow users to:
   - Toggle face visibility
   - Adjust face size (pixels)
   - Set custom image URL

4. Settings persist across browser sessions using storage API

## Development Commands

### Build Process
```bash
# Install dependencies
npm install

# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Loading the Extension
- **Development**: Load from `dist/` folder after running `npm run build`
  - **Firefox**: about:debugging → This Firefox → Load Temporary Add-on → select `dist/manifest.json`
  - **Chrome**: chrome://extensions → Enable Developer Mode → Load unpacked → select `dist` folder


## Browser Compatibility

The codebase handles both Firefox and Chrome APIs:
```javascript
if(window['browser'] === undefined) {
  window['browser'] = chrome;
  window['is_chrome'] = true;
}
```

## Project Structure

```
face/
├── src/                      # Source files
│   ├── manifest.json         # Extension manifest (v3)
│   ├── content-scripts/      
│   │   └── face.js          # Main content script
│   ├── popup/               
│   │   ├── settings.html    # Popup UI
│   │   ├── settings.js      # Popup logic
│   │   └── settings.css     # Popup styles
│   └── icons/               # Extension icons (48, 96, 128px)
├── public/                  # Static assets copied to dist
├── dist/                    # Build output (git-ignored)
├── vite.config.js          # Vite configuration
└── package.json            # Dependencies and scripts
```

## Important Technical Details

### Manifest V3
- Uses Manifest V3 for modern browser support
- Permissions: `storage`, `activeTab`, `scripting`
- Host permissions: `*://*/*`
- Content script injection: `"run_at": "document_idle"`

### Build Configuration
The `vite.config.js` is configured to:
- Use `src` as root directory
- Output to `dist` directory
- Copy static assets from `public` directory
- Handle Chrome extension specifics via vite-plugin-web-extension

### Storage and State Management
- Uses browser.storage.local for persistent settings
- Default values:
  - Active: true
  - Size: 150px
  - Image: `http://pngimg.com/uploads/face/face_PNG5660.png`
- Content script initializes with saved settings on page load

### Message Passing
- Popup sends messages to active tab's content script
- Messages contain setting updates: `{is_active, size, image}`
- Content script updates face appearance in real-time

## Common Development Tasks

### Adding New Settings
1. Update popup UI in `src/popup/settings.html`
2. Add event handlers in `src/popup/settings.js`
3. Handle new message properties in `src/content-scripts/face.js`
4. Update storage handling in both files

### Testing Changes
1. Run `npm run dev` for development mode
2. Load extension in browser
3. Open any webpage to see the face
4. Use popup to test settings changes
5. Check browser console for any errors

### Building for Release
1. Run `npm run build`
2. Test the production build from `dist/`
3. Create a zip of the `dist` folder for distribution
