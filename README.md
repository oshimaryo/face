# FACE

A browser extension that adds a movable face image to web pages. The face follows your mouse cursor and can be toggled between moving and static modes.

## Features

- Adds a customizable face image to any webpage
- Face follows mouse cursor when in "moving" mode
- Click the face to toggle between moving/static modes
- Configurable through popup settings:
  - Toggle face visibility
  - Adjust face size
  - Set custom image URL
- Works on both Chrome and Firefox

## Installation

### From Browser Stores
- Firefox: https://addons.mozilla.org/ja/firefox/addon/face-_-/

### Development Setup

1. Clone the repository:
```bash
git clone https://github.com/oshimaryo/face.git
cd face
```

2. Install dependencies:
```bash
npm install
```

3. Build the extension:
```bash
npm run build
```

4. Load the extension:
   - **Firefox**: Navigate to `about:debugging` → "This Firefox" → "Load Temporary Add-on" → Select `dist/manifest.json`
   - **Chrome**: Navigate to `chrome://extensions` → Enable "Developer mode" → "Load unpacked" → Select the `dist` folder

## Development

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Project Structure

```
face/
├── src/
│   ├── manifest.json         # Extension manifest (v3)
│   ├── content-scripts/      # Content scripts
│   │   └── face.js          # Main face logic
│   ├── popup/               # Extension popup
│   │   ├── settings.html
│   │   ├── settings.js
│   │   └── settings.css
│   └── icons/               # Extension icons
├── public/                  # Static assets
├── dist/                    # Build output
├── vite.config.js          # Vite configuration
└── package.json
```

### Browser Compatibility

The extension supports both Chrome and Firefox through Manifest V3.

## Screenshots

![](https://addons.cdn.mozilla.net/user-media/previews/thumbs/182/182676.png?modified=1543520775)

## License

This project is open source and available under the MIT License.
