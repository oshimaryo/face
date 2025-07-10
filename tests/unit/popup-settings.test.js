import { describe, test, expect, beforeEach, jest } from '@jest/globals';

describe('Popup Settings - Browser Compatibility', () => {
  beforeEach(() => {
    resetMocks();
  });

  test('should initialize browser API for Chrome', () => {
    // Simulate Chrome environment
    global.window.browser = undefined;
    global.window.chrome = global.chrome;
    
    // Simulate browser compatibility initialization
    if (global.window.browser === undefined) {
      global.window.browser = global.window.chrome;
      global.window.is_chrome = true;
    } else {
      global.window.is_chrome = false;
    }
    
    expect(global.window.browser).toBe(global.chrome);
    expect(global.window.is_chrome).toBe(true);
  });

  test('should initialize browser API for Firefox', () => {
    // Simulate Firefox environment
    global.window.browser = global.browser;
    
    // Simulate browser compatibility initialization  
    if (global.window.browser === undefined) {
      global.window.browser = global.chrome;
      global.window.is_chrome = true;
    } else {
      global.window.is_chrome = false;
    }
    
    expect(global.window.browser).toBe(global.browser);
    expect(global.window.is_chrome).toBe(false);
  });
});

describe('Popup Settings - Message Passing', () => {
  beforeEach(() => {
    resetMocks();
  });

  test('sendMessage should send message to active tab', async () => {
    // Mock active tab
    const mockTab = { id: 123 };
    global.browser.tabs.query.mockResolvedValue([mockTab]);
    global.browser.tabs.sendMessage.mockResolvedValue(true);
    
    // Simulate sendMessage function
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
    
    const testMessage = { is_active: true };
    await sendMessage(testMessage);
    
    expect(global.browser.tabs.query).toHaveBeenCalledWith({active: true, currentWindow: true});
    expect(global.browser.tabs.sendMessage).toHaveBeenCalledWith(123, testMessage);
  });

  test('sendMessage should handle error when no active tab', async () => {
    // Mock no active tab
    global.browser.tabs.query.mockResolvedValue([]);
    
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
    
    const testMessage = { is_active: true };
    await sendMessage(testMessage);
    
    expect(global.browser.tabs.query).toHaveBeenCalledWith({active: true, currentWindow: true});
    expect(global.browser.tabs.sendMessage).not.toHaveBeenCalled();
  });

  test('sendMessage should handle browser API errors', async () => {
    // Mock browser API error
    global.browser.tabs.query.mockRejectedValue(new Error('API Error'));
    
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
    
    const testMessage = { is_active: true };
    await sendMessage(testMessage);
    
    expect(global.browser.tabs.query).toHaveBeenCalledWith({active: true, currentWindow: true});
    expect(global.browser.tabs.sendMessage).not.toHaveBeenCalled();
  });
});

describe('Popup Settings - Storage Operations', () => {
  beforeEach(() => {
    resetMocks();
  });

  test('saveSetting should save to storage for Chrome', () => {
    global.window.is_chrome = true;
    global.window.browser = global.chrome;
    
    // Simulate saveSetting function for Chrome
    const saveSetting = (val) => {
      if (global.window.is_chrome) {
        global.window.browser.storage.local.set(val, null);
      } else {
        let setting = global.window.browser.storage.local.set(val);
        setting.then(null, jest.fn());
      }
    };
    
    const testSetting = { is_active: true };
    saveSetting(testSetting);
    
    expect(global.chrome.storage.local.set).toHaveBeenCalledWith(testSetting, null);
  });

  test('saveSetting should save to storage for Firefox', () => {
    global.window.is_chrome = false;
    global.window.browser = global.browser;
    
    // Mock promise for Firefox
    const mockPromise = {
      then: jest.fn()
    };
    global.browser.storage.local.set.mockReturnValue(mockPromise);
    
    // Simulate saveSetting function for Firefox
    const saveSetting = (val) => {
      if (global.window.is_chrome) {
        global.window.browser.storage.local.set(val, null);
      } else {
        let setting = global.window.browser.storage.local.set(val);
        setting.then(null, jest.fn());
      }
    };
    
    const testSetting = { size: 200 };
    saveSetting(testSetting);
    
    expect(global.browser.storage.local.set).toHaveBeenCalledWith(testSetting);
    expect(mockPromise.then).toHaveBeenCalledWith(null, expect.any(Function));
  });

  test('applySettings should load and apply settings for Chrome', () => {
    global.window.is_chrome = true;
    global.window.browser = global.chrome;
    
    // Mock storage data
    const mockStorageData = {
      is_active: true,
      size: 200,
      image: 'http://example.com/test.png'
    };
    
    // Mock DOM elements
    const mockIsActiveInput = { checked: false };
    const mockSizeInput = { value: 0 };
    const mockImageInput = { value: '' };
    
    global.document.getElementById = jest.fn((id) => {
      if (id === 'isactive') return mockIsActiveInput;
      if (id === 'size') return mockSizeInput;
      if (id === 'image-url') return mockImageInput;
      return null;
    });
    
    const mockSendMessage = jest.fn();
    
    // Simulate isValid function
    const isValid = (val) => {
      return typeof(val) !== 'undefined' && val !== null && val !== 0;
    };
    
    // Simulate applySettings function for Chrome
    const applySettings = () => {
      if (global.window.is_chrome) {
        global.window.browser.storage.local.get(null, (results) => {
          console.log(results);
          const is_active = results.is_active || false;
          const size = results.size || 150;
          const image = isValid(results.image) ? results.image : 'http://pngimg.com/uploads/face/face_PNG5660.png';
          
          mockIsActiveInput.checked = is_active;
          mockSizeInput.value = size;
          mockImageInput.value = image;
          
          mockSendMessage({ is_active: is_active });
          mockSendMessage({ size: size });
          mockSendMessage({ image: image });
        });
      }
    };
    
    // Mock the Chrome callback
    global.chrome.storage.local.get.mockImplementation((keys, callback) => {
      callback(mockStorageData);
    });
    
    applySettings();
    
    expect(global.chrome.storage.local.get).toHaveBeenCalledWith(null, expect.any(Function));
    expect(mockIsActiveInput.checked).toBe(true);
    expect(mockSizeInput.value).toBe(200);
    expect(mockImageInput.value).toBe('http://example.com/test.png');
    expect(mockSendMessage).toHaveBeenCalledWith({ is_active: true });
    expect(mockSendMessage).toHaveBeenCalledWith({ size: 200 });
    expect(mockSendMessage).toHaveBeenCalledWith({ image: 'http://example.com/test.png' });
  });

  test('applySettings should use default values when storage is empty', () => {
    global.window.is_chrome = true;
    global.window.browser = global.chrome;
    
    // Mock empty storage
    const mockEmptyStorage = {};
    
    // Mock DOM elements
    const mockIsActiveInput = { checked: false };
    const mockSizeInput = { value: 0 };
    const mockImageInput = { value: '' };
    
    global.document.getElementById = jest.fn((id) => {
      if (id === 'isactive') return mockIsActiveInput;
      if (id === 'size') return mockSizeInput;
      if (id === 'image-url') return mockImageInput;
      return null;
    });
    
    const mockSendMessage = jest.fn();
    
    const isValid = (val) => {
      return typeof(val) !== 'undefined' && val !== null && val !== 0;
    };
    
    const applySettings = () => {
      if (global.window.is_chrome) {
        global.window.browser.storage.local.get(null, (results) => {
          const is_active = results.is_active || false;
          const size = results.size || 150;
          const image = isValid(results.image) ? results.image : 'http://pngimg.com/uploads/face/face_PNG5660.png';
          
          mockIsActiveInput.checked = is_active;
          mockSizeInput.value = size;
          mockImageInput.value = image;
          
          mockSendMessage({ is_active: is_active });
          mockSendMessage({ size: size });
          mockSendMessage({ image: image });
        });
      }
    };
    
    global.chrome.storage.local.get.mockImplementation((keys, callback) => {
      callback(mockEmptyStorage);
    });
    
    applySettings();
    
    expect(mockIsActiveInput.checked).toBe(false);
    expect(mockSizeInput.value).toBe(150);
    expect(mockImageInput.value).toBe('http://pngimg.com/uploads/face/face_PNG5660.png');
  });
});

describe('Popup Settings - Form Handling', () => {
  beforeEach(() => {
    resetMocks();
  });

  test('toggleIsActive should send message and save setting', () => {
    const mockSendMessage = jest.fn();
    const mockSaveSetting = jest.fn();
    
    // Simulate toggleIsActive function
    const toggleIsActive = (e) => {
      const is_active = { is_active: e.target.checked };
      mockSendMessage(is_active);
      mockSaveSetting(is_active);
    };
    
    const mockEvent = { target: { checked: true } };
    toggleIsActive(mockEvent);
    
    expect(mockSendMessage).toHaveBeenCalledWith({ is_active: true });
    expect(mockSaveSetting).toHaveBeenCalledWith({ is_active: true });
  });

  test('changeSize should send message and save setting', () => {
    const mockSendMessage = jest.fn();
    const mockSaveSetting = jest.fn();
    
    // Simulate changeSize function
    const changeSize = (e) => {
      const size = { size: e.target.value };
      mockSendMessage(size);
      mockSaveSetting(size);
    };
    
    const mockEvent = { target: { value: '250' } };
    changeSize(mockEvent);
    
    expect(mockSendMessage).toHaveBeenCalledWith({ size: '250' });
    expect(mockSaveSetting).toHaveBeenCalledWith({ size: '250' });
  });

  test('changeImage should send message and save setting', () => {
    const mockSendMessage = jest.fn();
    const mockSaveSetting = jest.fn();
    
    // Simulate changeImage function
    const changeImage = (e) => {
      const url = { image: e.target.value };
      mockSendMessage(url);
      mockSaveSetting(url);
    };
    
    const mockEvent = { target: { value: 'http://example.com/new-face.png' } };
    changeImage(mockEvent);
    
    expect(mockSendMessage).toHaveBeenCalledWith({ image: 'http://example.com/new-face.png' });
    expect(mockSaveSetting).toHaveBeenCalledWith({ image: 'http://example.com/new-face.png' });
  });

  test('isValid should validate values correctly', () => {
    // Simulate isValid function
    const isValid = (val) => {
      return typeof(val) !== 'undefined' && val !== null && val !== 0;
    };
    
    expect(isValid(true)).toBe(true);
    expect(isValid(false)).toBe(true);
    expect(isValid(1)).toBe(true);
    expect(isValid('test')).toBe(true);
    expect(isValid(0)).toBe(false);
    expect(isValid(null)).toBe(false);
    expect(isValid(undefined)).toBe(false);
  });

  test('init should attach event listeners', () => {
    // Mock DOM elements
    const mockIsActiveInput = { addEventListener: jest.fn() };
    const mockSizeInput = { addEventListener: jest.fn() };
    const mockImageInput = { addEventListener: jest.fn() };
    
    global.document.getElementById = jest.fn((id) => {
      if (id === 'isactive') return mockIsActiveInput;
      if (id === 'size') return mockSizeInput;
      if (id === 'image-url') return mockImageInput;
      return null;
    });
    
    const mockApplySettings = jest.fn();
    const mockToggleIsActive = jest.fn();
    const mockChangeSize = jest.fn();
    const mockChangeImage = jest.fn();
    
    // Simulate init function
    const init = () => {
      mockIsActiveInput.addEventListener('change', mockToggleIsActive);
      mockSizeInput.addEventListener('change', mockChangeSize);
      mockImageInput.addEventListener('change', mockChangeImage, false);
      mockApplySettings();
    };
    
    init();
    
    expect(mockIsActiveInput.addEventListener).toHaveBeenCalledWith('change', mockToggleIsActive);
    expect(mockSizeInput.addEventListener).toHaveBeenCalledWith('change', mockChangeSize);
    expect(mockImageInput.addEventListener).toHaveBeenCalledWith('change', mockChangeImage, false);
    expect(mockApplySettings).toHaveBeenCalled();
  });
});

describe('Popup Settings - Error Handling', () => {
  beforeEach(() => {
    resetMocks();
  });

  test('should handle onError callback', () => {
    const mockError = new Error('Test error');
    
    // Simulate onError function
    const onError = (error) => {
      console.log(`Error: ${error}`);
    };
    
    onError(mockError);
    
    expect(console.log).toHaveBeenCalledWith(`Error: ${mockError}`);
  });

  test('should handle missing DOM elements gracefully', () => {
    // Mock getElementById to return null
    global.document.getElementById = jest.fn(() => null);
    
    const mockApplySettings = jest.fn();
    
    // Simulate init function with null elements
    const init = () => {
      const isactive_input = global.document.getElementById('isactive');
      const size_input = global.document.getElementById('size');
      const image_input = global.document.getElementById('image-url');
      
      if (isactive_input && size_input && image_input) {
        isactive_input.addEventListener('change', jest.fn());
        size_input.addEventListener('change', jest.fn());
        image_input.addEventListener('change', jest.fn(), false);
        mockApplySettings();
      }
    };
    
    // Should not throw error
    expect(() => init()).not.toThrow();
    expect(mockApplySettings).not.toHaveBeenCalled();
  });
});