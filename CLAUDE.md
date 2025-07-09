# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a browser extension called "FACE" that adds a movable face image to web pages. The face follows the mouse cursor and can be toggled between moving and static modes.

## Key Architecture

### Extension Structure
- **Content Script** (`content_scripts/face.js`): Injected into all web pages to display and control the face image
- **Popup Interface** (`popup/settings.html|js|css`): Settings panel for users to configure the extension
- **Message Passing**: Communication between popup and content scripts using browser.runtime.onMessage

### Core Functionality
1. Face image follows mouse cursor when in "moving" mode
2. Click face to toggle between moving/static modes
3. Settings allow users to:
   - Toggle face visibility
   - Adjust face size (pixels)
   - Set custom image URL

## Development Commands

This is a simple extension with no build process:
- **Load in Firefox**: about:debugging → Load Temporary Add-on → select manifest.json
- **Load in Chrome**: chrome://extensions → Enable Developer Mode → Load unpacked → select extension folder

## Browser Compatibility

The codebase handles both Firefox and Chrome APIs:
```javascript
if(window['browser'] === undefined) {
  window['browser'] = chrome;
  window['is_chrome'] = true;
}
```

## Important Notes

- Uses Manifest V2 (consider upgrading to V3 for modern browsers)
- No external dependencies or build tools
- Storage API persists user settings (active state, size, image URL)
- Default face image: `http://pngimg.com/uploads/face/face_PNG5660.png`
- Content script runs on all URLs: `"*://*/*"`