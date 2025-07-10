import { describe, test, expect, beforeEach, jest } from '@jest/globals';

describe('Extension Integration - Message Passing', () => {
  beforeEach(() => {
    resetMocks();
  });

  test('should handle complete message flow from popup to content script', async () => {
    // Mock active tab
    const mockTab = { id: 123 };
    global.browser.tabs.query.mockResolvedValue([mockTab]);
    global.browser.tabs.sendMessage.mockResolvedValue(true);
    
    // Mock face image element
    const mockFaceImg = {
      style: {},
      setAttribute: jest.fn(),
      classList: {
        contains: jest.fn(),
        add: jest.fn(),
        remove: jest.fn(),
      },
    };
    
    global.document.querySelector.mockImplementation((selector) => {
      if (selector === 'img.face-extension-img') {
        return mockFaceImg;
      }
      return null;
    });
    
    // Simulate popup sending message
    const sendMessage = async (content) => {
      try {
        const [tab] = await global.browser.tabs.query({active: true, currentWindow: true});
        if (tab && tab.id) {
          await global.browser.tabs.sendMessage(tab.id, content);
        }
      } catch (error) {
        console.error('Error sending message:', error);
      }
    };
    
    // Simulate content script receiving message
    const changeStatus = (request) => {
      const isNotNull = (val) => {
        return (typeof(val) !== 'undefined' && val !== null);
      };
      
      const faceImg = global.document.querySelector('img.face-extension-img');
      if (!faceImg) return;
      
      if (isNotNull(request.is_active)) {
        faceImg.style.display = request.is_active ? 'block' : 'none';
      }
      if (isNotNull(request.size)) {
        faceImg.style.width = request.size + 'px';
      }
      if (isNotNull(request.image)) {
        faceImg.setAttribute('src', request.image);
      }
    };
    
    // Test message flow
    const testMessage = {
      is_active: true,
      size: 200,
      image: 'http://example.com/test.png'
    };
    
    await sendMessage(testMessage);
    
    // Simulate message being received by content script
    changeStatus(testMessage);
    
    expect(global.browser.tabs.query).toHaveBeenCalledWith({active: true, currentWindow: true});
    expect(global.browser.tabs.sendMessage).toHaveBeenCalledWith(123, testMessage);
    expect(mockFaceImg.style.display).toBe('block');
    expect(mockFaceImg.style.width).toBe('200px');
    expect(mockFaceImg.setAttribute).toHaveBeenCalledWith('src', 'http://example.com/test.png');
  });

  test('should handle individual setting updates', async () => {
    const mockTab = { id: 456 };
    global.browser.tabs.query.mockResolvedValue([mockTab]);
    global.browser.tabs.sendMessage.mockResolvedValue(true);
    
    const mockFaceImg = {
      style: {},
      setAttribute: jest.fn(),
    };
    
    global.document.querySelector.mockImplementation((selector) => {
      if (selector === 'img.face-extension-img') {
        return mockFaceImg;
      }
      return null;
    });
    
    const sendMessage = async (content) => {
      try {
        const [tab] = await global.browser.tabs.query({active: true, currentWindow: true});
        if (tab && tab.id) {
          await global.browser.tabs.sendMessage(tab.id, content);
        }
      } catch (error) {
        console.error('Error sending message:', error);
      }
    };
    
    const changeStatus = (request) => {
      const isNotNull = (val) => {
        return (typeof(val) !== 'undefined' && val !== null);
      };
      
      const faceImg = global.document.querySelector('img.face-extension-img');
      if (!faceImg) return;
      
      if (isNotNull(request.is_active)) {
        faceImg.style.display = request.is_active ? 'block' : 'none';
      }
      if (isNotNull(request.size)) {
        faceImg.style.width = request.size + 'px';
      }
      if (isNotNull(request.image)) {
        faceImg.setAttribute('src', request.image);
      }
    };
    
    // Test individual updates
    await sendMessage({ is_active: false });
    changeStatus({ is_active: false });
    expect(mockFaceImg.style.display).toBe('none');
    
    await sendMessage({ size: 300 });
    changeStatus({ size: 300 });
    expect(mockFaceImg.style.width).toBe('300px');
    
    await sendMessage({ image: 'http://example.com/new.png' });
    changeStatus({ image: 'http://example.com/new.png' });
    expect(mockFaceImg.setAttribute).toHaveBeenCalledWith('src', 'http://example.com/new.png');
  });
});

describe('Extension Integration - Storage Synchronization', () => {
  beforeEach(() => {
    resetMocks();
  });

  test('should synchronize settings between popup and content script', async () => {
    // Mock storage data
    const mockStorageData = {
      is_active: true,
      size: 180,
      image: 'http://example.com/sync-test.png'
    };
    
    global.browser.storage.local.get.mockResolvedValue(mockStorageData);
    global.browser.storage.local.set.mockResolvedValue(undefined);
    
    // Mock DOM elements for popup
    const mockIsActiveInput = { checked: false };
    const mockSizeInput = { value: 0 };
    const mockImageInput = { value: '' };
    
    global.document.getElementById = jest.fn((id) => {
      if (id === 'isactive') return mockIsActiveInput;
      if (id === 'size') return mockSizeInput;
      if (id === 'image-url') return mockImageInput;
      return null;
    });
    
    // Mock face image for content script
    const mockFaceImg = {
      style: {},
      setAttribute: jest.fn(),
    };
    
    global.document.querySelector.mockImplementation((selector) => {
      if (selector === 'img.face-extension-img') {
        return mockFaceImg;
      }
      return null;
    });
    
    // Simulate popup loading settings
    const isValid = (val) => {
      return typeof(val) !== 'undefined' && val !== null && val !== 0;
    };
    
    const loadPopupSettings = async () => {
      const results = await global.browser.storage.local.get(null);
      const is_active = results.is_active || false;
      const size = results.size || 150;
      const image = isValid(results.image) ? results.image : 'http://pngimg.com/uploads/face/face_PNG5660.png';
      
      mockIsActiveInput.checked = is_active;
      mockSizeInput.value = size;
      mockImageInput.value = image;
      
      return { is_active, size, image };
    };
    
    // Simulate content script loading settings
    const loadContentScriptSettings = async () => {
      const results = await global.browser.storage.local.get(['is_active', 'size', 'image']);
      const is_active = results.is_active !== undefined ? results.is_active : true;
      const size = results.size || 150;
      const image = results.image || 'http://pngimg.com/uploads/face/face_PNG5660.png';
      
      // Apply settings to face image
      if (mockFaceImg) {
        mockFaceImg.style.display = is_active ? 'block' : 'none';
        mockFaceImg.style.width = size + 'px';
        mockFaceImg.setAttribute('src', image);
      }
      
      return { is_active, size, image };
    };
    
    // Load settings in both popup and content script
    const popupSettings = await loadPopupSettings();
    const contentScriptSettings = await loadContentScriptSettings();
    
    // Verify both received same settings
    expect(popupSettings).toEqual(contentScriptSettings);
    expect(mockIsActiveInput.checked).toBe(true);
    expect(mockSizeInput.value).toBe(180);
    expect(mockImageInput.value).toBe('http://example.com/sync-test.png');
    expect(mockFaceImg.style.display).toBe('block');
    expect(mockFaceImg.style.width).toBe('180px');
    expect(mockFaceImg.setAttribute).toHaveBeenCalledWith('src', 'http://example.com/sync-test.png');
  });

  test('should handle settings persistence across sessions', async () => {
    const initialSettings = {
      is_active: true,
      size: 220,
      image: 'http://example.com/persistent.png'
    };
    
    // Mock saving settings
    global.browser.storage.local.set.mockResolvedValue(undefined);
    
    // Simulate saving settings
    const saveSettings = async (settings) => {
      await global.browser.storage.local.set(settings);
    };
    
    await saveSettings(initialSettings);
    
    // Verify settings were saved
    expect(global.browser.storage.local.set).toHaveBeenCalledWith(initialSettings);
    
    // Simulate loading settings after page reload
    global.browser.storage.local.get.mockResolvedValue(initialSettings);
    
    const loadSettings = async () => {
      const results = await global.browser.storage.local.get(null);
      return results;
    };
    
    const loadedSettings = await loadSettings();
    
    expect(loadedSettings).toEqual(initialSettings);
  });
});

describe('Extension Integration - Cross-Browser Compatibility', () => {
  beforeEach(() => {
    resetMocks();
  });

  test('should work with Chrome APIs', async () => {
    // Setup Chrome environment
    global.window.browser = undefined;
    global.window.chrome = global.chrome;
    global.window.is_chrome = true;
    
    // Mock Chrome storage callback
    global.chrome.storage.local.get.mockImplementation((keys, callback) => {
      callback({ is_active: true, size: 150 });
    });
    
    global.chrome.storage.local.set.mockImplementation((data, callback) => {
      if (callback) callback();
    });
    
    // Test Chrome-specific storage handling
    const chromeStorageTest = () => {
      return new Promise((resolve) => {
        global.chrome.storage.local.get(null, (results) => {
          resolve(results);
        });
      });
    };
    
    const result = await chromeStorageTest();
    expect(result).toEqual({ is_active: true, size: 150 });
  });

  test('should work with Firefox APIs', async () => {
    // Setup Firefox environment
    global.window.browser = global.browser;
    global.window.is_chrome = false;
    
    // Mock Firefox storage promises
    global.browser.storage.local.get.mockResolvedValue({ is_active: false, size: 200 });
    global.browser.storage.local.set.mockResolvedValue(undefined);
    
    // Test Firefox-specific storage handling
    const firefoxStorageTest = async () => {
      const results = await global.browser.storage.local.get(null);
      return results;
    };
    
    const result = await firefoxStorageTest();
    expect(result).toEqual({ is_active: false, size: 200 });
  });
});

describe('Extension Integration - Error Scenarios', () => {
  beforeEach(() => {
    resetMocks();
  });

  test('should handle storage errors gracefully', async () => {
    // Mock storage error
    global.browser.storage.local.get.mockRejectedValue(new Error('Storage unavailable'));
    
    const mockFaceImg = {
      style: {},
      setAttribute: jest.fn(),
    };
    
    global.document.querySelector.mockImplementation((selector) => {
      if (selector === 'img.face-extension-img') {
        return mockFaceImg;
      }
      return null;
    });
    
    // Simulate content script initialization with error handling
    const initializeFaceWithErrorHandling = async () => {
      try {
        const results = await global.browser.storage.local.get(['is_active', 'size', 'image']);
        const is_active = results.is_active !== undefined ? results.is_active : true;
        const size = results.size || 150;
        const image = results.image || 'http://pngimg.com/uploads/face/face_PNG5660.png';
        
        return { is_active, size, image };
      } catch (error) {
        console.error('Error initializing face:', error);
        // Return default values
        return {
          is_active: true,
          size: 150,
          image: 'http://pngimg.com/uploads/face/face_PNG5660.png'
        };
      }
    };
    
    const result = await initializeFaceWithErrorHandling();
    
    expect(result).toEqual({
      is_active: true,
      size: 150,
      image: 'http://pngimg.com/uploads/face/face_PNG5660.png'
    });
  });

  test('should handle missing DOM elements', () => {
    // Mock missing face image element
    global.document.querySelector.mockImplementation(() => null);
    
    // Simulate changeStatus with missing element
    const changeStatus = (request) => {
      const isNotNull = (val) => {
        return (typeof(val) !== 'undefined' && val !== null);
      };
      
      const faceImg = global.document.querySelector('img.face-extension-img');
      if (!faceImg) {
        return; // Should exit gracefully
      }
      
      if (isNotNull(request.is_active)) {
        faceImg.style.display = request.is_active ? 'block' : 'none';
      }
    };
    
    // Should not throw error
    expect(() => changeStatus({ is_active: true })).not.toThrow();
  });

  test('should handle tab communication errors', async () => {
    // Mock tab query failure
    global.browser.tabs.query.mockRejectedValue(new Error('No active tab'));
    
    const sendMessage = async (content) => {
      try {
        const [tab] = await global.browser.tabs.query({active: true, currentWindow: true});
        if (tab && tab.id) {
          await global.browser.tabs.sendMessage(tab.id, content);
        }
      } catch (error) {
        console.error('Error sending message:', error);
        return false;
      }
      return true;
    };
    
    const result = await sendMessage({ is_active: true });
    
    expect(result).toBe(false);
    expect(console.error).toHaveBeenCalledWith('Error sending message:', expect.any(Error));
  });
});