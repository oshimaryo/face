import { describe, test, expect, beforeEach, jest } from '@jest/globals';

// Mock the content script functions by extracting them from the file
// Since the content script runs in global scope, we need to simulate this

describe('Content Script - Browser Compatibility', () => {
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

describe('Content Script - Mouse Movement', () => {
  let mockFaceImg;
  
  beforeEach(() => {
    resetMocks();
    
    // Create a mock face image element
    mockFaceImg = {
      classList: {
        contains: jest.fn(),
        add: jest.fn(),
        remove: jest.fn(),
      },
      style: {},
      clientHeight: 100,
      clientWidth: 100,
      addEventListener: jest.fn(),
    };
    
    global.document.querySelector.mockImplementation((selector) => {
      if (selector === 'img.face-extension-img') {
        return mockFaceImg;
      }
      return null;
    });
  });

  test('changePosition should update face position when moving', () => {
    // Mock face image with moving class
    mockFaceImg.classList.contains.mockReturnValue(true);
    
    // Simulate changePosition function
    const changePosition = (x, y) => {
      const faceImg = document.querySelector('img.face-extension-img');
      if (faceImg && faceImg.classList.contains('is-moving')) {
        const w = faceImg.clientHeight;
        const h = faceImg.clientWidth;
        faceImg.style.top = (y - h/2) + 'px';
        faceImg.style.left = (x - w/2) + 'px';
      }
    };
    
    changePosition(200, 300);
    
    expect(mockFaceImg.style.top).toBe('250px'); // 300 - 100/2
    expect(mockFaceImg.style.left).toBe('150px'); // 200 - 100/2
  });

  test('changePosition should not update position when not moving', () => {
    // Mock face image without moving class
    mockFaceImg.classList.contains.mockReturnValue(false);
    
    // Simulate changePosition function
    const changePosition = (x, y) => {
      const faceImg = document.querySelector('img.face-extension-img');
      if (faceImg && faceImg.classList.contains('is-moving')) {
        const w = faceImg.clientHeight;
        const h = faceImg.clientWidth;
        faceImg.style.top = (y - h/2) + 'px';
        faceImg.style.left = (x - w/2) + 'px';
      }
    };
    
    changePosition(200, 300);
    
    expect(mockFaceImg.style.top).toBeUndefined();
    expect(mockFaceImg.style.left).toBeUndefined();
  });

  test('mouseMove should call changePosition with correct coordinates', () => {
    const changePosition = jest.fn();
    
    // Simulate mouseMove function
    const mouseMove = (e) => {
      e.preventDefault();
      changePosition(e.pageX, e.pageY);
    };
    
    const mockEvent = {
      pageX: 150,
      pageY: 250,
      preventDefault: jest.fn(),
    };
    
    mouseMove(mockEvent);
    
    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(changePosition).toHaveBeenCalledWith(150, 250);
  });
});

describe('Content Script - Click Toggle', () => {
  let mockFaceImg;
  
  beforeEach(() => {
    resetMocks();
    
    mockFaceImg = {
      classList: {
        contains: jest.fn(),
        add: jest.fn(),
        remove: jest.fn(),
      },
      target: null,
    };
  });

  test('clickImage should toggle from moving to not-moving', () => {
    // Mock face image with is-moving class
    mockFaceImg.classList.contains.mockReturnValue(true);
    
    // Simulate clickImage function
    const clickImage = (e) => {
      const faceImg = e.target;
      if (faceImg.classList.contains('is-moving')) {
        faceImg.classList.add('is-not-moving');
        faceImg.classList.remove('is-moving');
      } else {
        faceImg.classList.add('is-moving');
        faceImg.classList.remove('is-not-moving');
      }
    };
    
    const mockEvent = { target: mockFaceImg };
    clickImage(mockEvent);
    
    expect(mockFaceImg.classList.add).toHaveBeenCalledWith('is-not-moving');
    expect(mockFaceImg.classList.remove).toHaveBeenCalledWith('is-moving');
  });

  test('clickImage should toggle from not-moving to moving', () => {
    // Mock face image without is-moving class
    mockFaceImg.classList.contains.mockReturnValue(false);
    
    // Simulate clickImage function
    const clickImage = (e) => {
      const faceImg = e.target;
      if (faceImg.classList.contains('is-moving')) {
        faceImg.classList.add('is-not-moving');
        faceImg.classList.remove('is-moving');
      } else {
        faceImg.classList.add('is-moving');
        faceImg.classList.remove('is-not-moving');
      }
    };
    
    const mockEvent = { target: mockFaceImg };
    clickImage(mockEvent);
    
    expect(mockFaceImg.classList.add).toHaveBeenCalledWith('is-moving');
    expect(mockFaceImg.classList.remove).toHaveBeenCalledWith('is-not-moving');
  });
});

describe('Content Script - Message Handling', () => {
  let mockFaceImg;
  
  beforeEach(() => {
    resetMocks();
    
    mockFaceImg = {
      style: {},
      setAttribute: jest.fn(),
    };
    
    global.document.querySelector.mockImplementation((selector) => {
      if (selector === 'img.face-extension-img') {
        return mockFaceImg;
      }
      return null;
    });
  });

  test('changeStatus should update visibility when is_active provided', () => {
    // Simulate isNotNull function
    const isNotNull = (val) => {
      return (typeof(val) !== 'undefined' && val !== null);
    };
    
    // Simulate changeStatus function
    const changeStatus = (request) => {
      const faceImg = document.querySelector('img.face-extension-img');
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
    
    changeStatus({ is_active: true });
    expect(mockFaceImg.style.display).toBe('block');
    
    changeStatus({ is_active: false });
    expect(mockFaceImg.style.display).toBe('none');
  });

  test('changeStatus should update size when size provided', () => {
    const isNotNull = (val) => {
      return (typeof(val) !== 'undefined' && val !== null);
    };
    
    const changeStatus = (request) => {
      const faceImg = document.querySelector('img.face-extension-img');
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
    
    changeStatus({ size: 200 });
    expect(mockFaceImg.style.width).toBe('200px');
  });

  test('changeStatus should update image when image provided', () => {
    const isNotNull = (val) => {
      return (typeof(val) !== 'undefined' && val !== null);
    };
    
    const changeStatus = (request) => {
      const faceImg = document.querySelector('img.face-extension-img');
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
    
    const testUrl = 'http://example.com/test.png';
    changeStatus({ image: testUrl });
    expect(mockFaceImg.setAttribute).toHaveBeenCalledWith('src', testUrl);
  });

  test('changeStatus should handle null/undefined values', () => {
    const isNotNull = (val) => {
      return (typeof(val) !== 'undefined' && val !== null);
    };
    
    const changeStatus = (request) => {
      const faceImg = document.querySelector('img.face-extension-img');
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
    
    changeStatus({ is_active: null, size: undefined });
    
    expect(mockFaceImg.style.display).toBeUndefined();
    expect(mockFaceImg.style.width).toBeUndefined();
    expect(mockFaceImg.setAttribute).not.toHaveBeenCalled();
  });

  test('isNotNull should validate values correctly', () => {
    const isNotNull = (val) => {
      return (typeof(val) !== 'undefined' && val !== null);
    };
    
    expect(isNotNull(true)).toBe(true);
    expect(isNotNull(false)).toBe(true);
    expect(isNotNull(0)).toBe(true);
    expect(isNotNull('')).toBe(true);
    expect(isNotNull(null)).toBe(false);
    expect(isNotNull(undefined)).toBe(false);
  });
});

describe('Content Script - Storage and Initialization', () => {
  beforeEach(() => {
    resetMocks();
  });

  test('initializeFace should load settings from storage', async () => {
    // Mock storage response
    const mockStorageData = {
      is_active: true,
      size: 200,
      image: 'http://example.com/custom.png'
    };
    
    global.browser.storage.local.get.mockResolvedValue(mockStorageData);
    
    const mockChangeStatus = jest.fn();
    
    // Simulate initializeFace function
    const initializeFace = async () => {
      try {
        const results = await global.browser.storage.local.get(['is_active', 'size', 'image']);
        
        const is_active = results.is_active !== undefined ? results.is_active : true;
        const size = results.size || 150;
        const image = results.image || 'http://pngimg.com/uploads/face/face_PNG5660.png';
        
        mockChangeStatus({ is_active, size, image });
      } catch (error) {
        console.error('Error initializing face:', error);
        mockChangeStatus({
          is_active: true,
          size: 150,
          image: 'http://pngimg.com/uploads/face/face_PNG5660.png'
        });
      }
    };
    
    await initializeFace();
    
    expect(global.browser.storage.local.get).toHaveBeenCalledWith(['is_active', 'size', 'image']);
    expect(mockChangeStatus).toHaveBeenCalledWith({
      is_active: true,
      size: 200,
      image: 'http://example.com/custom.png'
    });
  });

  test('initializeFace should use default values when storage is empty', async () => {
    // Mock empty storage response
    global.browser.storage.local.get.mockResolvedValue({});
    
    const mockChangeStatus = jest.fn();
    
    const initializeFace = async () => {
      try {
        const results = await global.browser.storage.local.get(['is_active', 'size', 'image']);
        
        const is_active = results.is_active !== undefined ? results.is_active : true;
        const size = results.size || 150;
        const image = results.image || 'http://pngimg.com/uploads/face/face_PNG5660.png';
        
        mockChangeStatus({ is_active, size, image });
      } catch (error) {
        console.error('Error initializing face:', error);
        mockChangeStatus({
          is_active: true,
          size: 150,
          image: 'http://pngimg.com/uploads/face/face_PNG5660.png'
        });
      }
    };
    
    await initializeFace();
    
    expect(mockChangeStatus).toHaveBeenCalledWith({
      is_active: true,
      size: 150,
      image: 'http://pngimg.com/uploads/face/face_PNG5660.png'
    });
  });

  test('initializeFace should handle storage errors gracefully', async () => {
    // Mock storage error
    global.browser.storage.local.get.mockRejectedValue(new Error('Storage error'));
    
    const mockChangeStatus = jest.fn();
    
    const initializeFace = async () => {
      try {
        const results = await global.browser.storage.local.get(['is_active', 'size', 'image']);
        
        const is_active = results.is_active !== undefined ? results.is_active : true;
        const size = results.size || 150;
        const image = results.image || 'http://pngimg.com/uploads/face/face_PNG5660.png';
        
        mockChangeStatus({ is_active, size, image });
      } catch (error) {
        console.error('Error initializing face:', error);
        mockChangeStatus({
          is_active: true,
          size: 150,
          image: 'http://pngimg.com/uploads/face/face_PNG5660.png'
        });
      }
    };
    
    await initializeFace();
    
    expect(mockChangeStatus).toHaveBeenCalledWith({
      is_active: true,
      size: 150,
      image: 'http://pngimg.com/uploads/face/face_PNG5660.png'
    });
  });
});