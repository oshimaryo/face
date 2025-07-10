// Test setup file for browser extension testing
import { jest } from '@jest/globals';

// Mock browser APIs globally
global.chrome = {
  storage: {
    local: {
      get: jest.fn(),
      set: jest.fn(),
    },
  },
  runtime: {
    onMessage: {
      addListener: jest.fn(),
    },
    sendMessage: jest.fn(),
  },
  tabs: {
    query: jest.fn(),
    sendMessage: jest.fn(),
  },
};

global.browser = {
  storage: {
    local: {
      get: jest.fn(),
      set: jest.fn(),
    },
  },
  runtime: {
    onMessage: {
      addListener: jest.fn(),
    },
    sendMessage: jest.fn(),
  },
  tabs: {
    query: jest.fn(),
    sendMessage: jest.fn(),
  },
};

// Mock DOM APIs
global.document = {
  createElement: jest.fn(),
  querySelector: jest.fn(),
  addEventListener: jest.fn(),
  body: {
    appendChild: jest.fn(),
    addEventListener: jest.fn(),
  },
  readyState: 'complete',
};

// Mock window object
global.window = {
  browser: undefined,
  is_chrome: false,
};

// Helper function to reset all mocks
global.resetMocks = () => {
  jest.clearAllMocks();
  
  // Reset browser API mocks
  global.chrome.storage.local.get.mockClear();
  global.chrome.storage.local.set.mockClear();
  global.chrome.runtime.onMessage.addListener.mockClear();
  global.chrome.runtime.sendMessage.mockClear();
  global.chrome.tabs.query.mockClear();
  global.chrome.tabs.sendMessage.mockClear();
  
  global.browser.storage.local.get.mockClear();
  global.browser.storage.local.set.mockClear();
  global.browser.runtime.onMessage.addListener.mockClear();
  global.browser.runtime.sendMessage.mockClear();
  global.browser.tabs.query.mockClear();
  global.browser.tabs.sendMessage.mockClear();
  
  // Reset DOM mocks
  global.document.createElement.mockClear();
  global.document.querySelector.mockClear();
  global.document.addEventListener.mockClear();
  global.document.body.appendChild.mockClear();
  global.document.body.addEventListener.mockClear();
  
  // Reset window state
  global.window.browser = undefined;
  global.window.is_chrome = false;
};

// Set up default mock implementations
global.document.createElement.mockImplementation((tag) => {
  const element = {
    tagName: tag.toUpperCase(),
    classList: {
      add: jest.fn(),
      remove: jest.fn(),
      contains: jest.fn(() => false),
    },
    style: {},
    setAttribute: jest.fn(),
    addEventListener: jest.fn(),
    clientHeight: 100,
    clientWidth: 100,
  };
  
  if (tag === 'img') {
    element.src = '';
    element.alt = '';
  }
  
  return element;
});

global.document.querySelector.mockImplementation((selector) => {
  if (selector === 'img.face-extension-img') {
    return global.document.createElement('img');
  }
  return null;
});

// Mock console to avoid noise in tests
global.console = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
};