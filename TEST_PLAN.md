# Test Plan for FACE Browser Extension

## Overview

This document outlines the comprehensive testing strategy for the FACE browser extension, which adds a movable face image to web pages.

## Test Categories

### 1. Unit Tests

#### Content Script Tests (`src/content-scripts/face.js`)

**Browser Compatibility**
- ✅ Test `window['browser']` initialization for Chrome
- ✅ Test `window['browser']` initialization for Firefox
- ✅ Test `window['is_chrome']` flag setting

**Mouse Movement Functionality**
- ✅ Test `mouseMove()` function calls `changePosition()` with correct coordinates
- ✅ Test `changePosition()` updates face position when element has 'is-moving' class
- ✅ Test `changePosition()` ignores position updates when element lacks 'is-moving' class
- ✅ Test position calculation with face dimensions (width/height centering)

**Click Toggle Functionality**
- ✅ Test `clickImage()` toggles from 'is-moving' to 'is-not-moving' class
- ✅ Test `clickImage()` toggles from 'is-not-moving' to 'is-moving' class
- ✅ Test click event only affects the clicked image element

**Message Handling**
- ✅ Test `changeStatus()` updates visibility when `is_active` is provided
- ✅ Test `changeStatus()` updates size when `size` is provided
- ✅ Test `changeStatus()` updates image source when `image` is provided
- ✅ Test `changeStatus()` handles null/undefined values gracefully
- ✅ Test `isNotNull()` utility function validation

**Storage and Initialization**
- ✅ Test `initializeFace()` loads saved settings from storage
- ✅ Test `initializeFace()` applies default values when storage is empty
- ✅ Test `initializeFace()` handles storage errors gracefully
- ✅ Test DOM ready state handling for initialization

**DOM Manipulation**
- ✅ Test face image element creation and styling
- ✅ Test face image appending to document body
- ✅ Test event listener attachment for mouse movement and clicks

#### Popup Settings Tests (`src/popup/settings.js`)

**Browser Compatibility**
- ✅ Test browser API initialization for Chrome and Firefox

**Settings Management**
- ✅ Test `toggleIsActive()` sends message and saves setting
- ✅ Test `changeSize()` sends message and saves setting
- ✅ Test `changeImage()` sends message and saves setting
- ✅ Test `isValid()` utility function validation

**Storage Operations**
- ✅ Test `saveSetting()` for Chrome (callback-based)
- ✅ Test `saveSetting()` for Firefox (promise-based)
- ✅ Test `applySettings()` loads and applies saved settings
- ✅ Test default value handling when storage is empty

**Message Passing**
- ✅ Test `sendMessage()` sends messages to active tab
- ✅ Test `sendMessage()` handles errors when no active tab
- ✅ Test `sendMessage()` handles browser API errors

**Form Handling**
- ✅ Test event listener attachment for form elements
- ✅ Test form input validation and sanitization
- ✅ Test initialization sequence in `init()` function

### 2. Integration Tests

#### Browser Extension Integration
- ✅ Test message passing between popup and content script
- ✅ Test storage synchronization between popup and content script
- ✅ Test settings persistence across browser sessions
- ✅ Test extension behavior on page reload
- ✅ Test extension behavior on tab switching

#### Cross-Browser Compatibility
- ✅ Test Chrome extension APIs (chrome.*)
- ✅ Test Firefox extension APIs (browser.*)
- ✅ Test storage API compatibility
- ✅ Test message passing API compatibility

### 3. UI/UX Tests

#### Face Image Behavior
- ✅ Test face follows mouse cursor when in moving mode
- ✅ Test face stays static when in non-moving mode
- ✅ Test face visibility toggle
- ✅ Test face size adjustment
- ✅ Test custom image URL loading

#### Settings Popup
- ✅ Test popup opens and displays current settings
- ✅ Test settings form inputs work correctly
- ✅ Test settings apply immediately to active tab
- ✅ Test settings persist after popup closes

### 4. Error Handling Tests

#### Storage Errors
- ✅ Test behavior when storage API is unavailable
- ✅ Test behavior when storage quota is exceeded
- ✅ Test behavior when storage data is corrupted

#### Network Errors
- ✅ Test behavior when custom image URL fails to load
- ✅ Test fallback to default image on network errors

#### Browser API Errors
- ✅ Test behavior when message passing fails
- ✅ Test behavior when tab query fails
- ✅ Test behavior when extension context is invalid

### 5. Performance Tests

#### Memory Usage
- ✅ Test memory usage during mouse movement
- ✅ Test memory cleanup on tab close
- ✅ Test memory usage with large custom images

#### Event Handling
- ✅ Test mouse movement performance with high frequency events
- ✅ Test event listener cleanup
- ✅ Test DOM manipulation performance

## Test Implementation Strategy

### Testing Framework
- **Jest**: For unit tests and mocking browser APIs
- **Puppeteer**: For browser automation and integration tests
- **Sinon**: For spying and stubbing browser extension APIs

### Mock Strategy
- Mock browser storage API (chrome.storage.local / browser.storage.local)
- Mock browser messaging API (chrome.runtime / browser.runtime)
- Mock browser tabs API (chrome.tabs / browser.tabs)
- Mock DOM elements and events

### Test Environment Setup
- Set up test environment with jsdom for DOM manipulation tests
- Configure browser extension mocks for Chrome and Firefox APIs
- Set up test data fixtures for storage and settings

### Continuous Integration
- Run tests on multiple Node.js versions
- Run tests for both Chrome and Firefox API compatibility
- Generate test coverage reports
- Fail build if test coverage falls below threshold

## Test Data

### Sample Settings
```javascript
const testSettings = {
  is_active: true,
  size: 150,
  image: 'http://example.com/test-face.png'
};
```

### Sample Messages
```javascript
const testMessages = {
  toggleActive: { is_active: false },
  changeSize: { size: 200 },
  changeImage: { image: 'http://example.com/new-face.png' }
};
```

## Success Criteria

- All unit tests pass with 100% code coverage
- Integration tests pass in both Chrome and Firefox environments
- UI tests demonstrate proper functionality across different scenarios
- Error handling tests verify graceful degradation
- Performance tests meet acceptable thresholds for memory usage and responsiveness

## Test Execution

### Local Development
```bash
npm test              # Run all tests
npm run test:unit     # Run unit tests only
npm run test:integration  # Run integration tests only
npm run test:coverage     # Run tests with coverage report
```

### CI/CD Pipeline
- Automated test execution on every pull request
- Test results reporting in pull request status
- Coverage reporting to track test completeness
- Cross-browser testing using browser testing services