const onError = (error) => {
  console.log(`Error: ${error}`);
}

const sendMessage = (content) => {
  browser.tabs.executeScript(null, {
    file: "/content_scripts/face.js"
  });

  if (window['is_chrome']) {
    browser.tabs.query(
      {active: true, currentWindow: true},
      (tabs) => {browser.tabs.sendMessage(tabs[0].id, content);}
    );
  } else {
    const gettingActiveTab = browser.tabs.query({active: true, currentWindow: true});
    gettingActiveTab.then((tabs) => {
      browser.tabs.sendMessage(tabs[0].id, content);
    });
  }

}

const saveSetting = (val) => {
  if (window['is_chrome']) {
    browser.storage.local.set(val, null);
  } else {
    let setting  = browser.storage.local.set(val);
    setting.then(null, onError);
  }
}

const insertImage = (src) => {
  const img = document.createElement('img');
  img.src = src;
  document.getElementsByClassName('option--image').appendChild(img);
}

const toggleIsActive = (e) => {
  const is_active = {is_active: e.target.checked};
  sendMessage(is_active);
  saveSetting(is_active);
};

const changeSize = (e) => {
  console.log(e);
  const size = {size: e.target.value};
  sendMessage(size);
  saveSetting(size);
};

const isValidImageUrl = (url) => {
  if (!url || !url.trim()) return false;
  try {
    const urlObj = new URL(url);
    return ['http:', 'https:', 'data:'].includes(urlObj.protocol);
  } catch {
    // Allow relative URLs or extension URLs
    return url.startsWith('/') || url.startsWith('chrome-extension://') || url.startsWith('moz-extension://');
  }
};

const changeImage = (e) => {
  console.log(e);
  const url = e.target.value.trim();
  
  if (url && !isValidImageUrl(url)) {
    alert('Please enter a valid image URL (http://, https://, or data:)');
    return;
  }
  
  const urlData = {image: url, imageType: 'url'};
  sendMessage(urlData);
  saveSetting(urlData);
  
  if (url) {
    saveUrlToHistory(url);
  }
};

const changeImageType = (e) => {
  const imageType = e.target.value;
  const imageUrl = document.getElementById('image-url');
  const imageFile = document.getElementById('image-file');
  
  if (imageType === 'url') {
    imageUrl.disabled = false;
    imageFile.disabled = true;
    imageFile.value = '';
    clearImagePreview();
  } else {
    imageUrl.disabled = true;
    imageFile.disabled = false;
  }
};

const handleFileSelect = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  
  if (!file.type.startsWith('image/')) {
    alert('Please select an image file.');
    e.target.value = '';
    return;
  }
  
  // File size validation (500KB limit)
  const MAX_FILE_SIZE = 500 * 1024; // 500KB
  if (file.size > MAX_FILE_SIZE) {
    alert('File size must be less than 500KB');
    e.target.value = '';
    return;
  }
  
  // Show loading state
  showLoadingState();
  
  const reader = new FileReader();
  reader.onload = (event) => {
    const base64Data = event.target.result;
    hideLoadingState();
    showImagePreview(base64Data);
    
    const imageData = {
      image: base64Data,
      imageType: 'file'
    };
    
    sendMessage(imageData);
    saveSetting(imageData);
  };
  
  reader.onerror = () => {
    hideLoadingState();
    alert('Failed to read the file. Please try again.');
    e.target.value = '';
  };
  
  reader.readAsDataURL(file);
};

const showImagePreview = (src) => {
  const preview = document.getElementById('image-preview');
  if (!preview) return;
  
  preview.innerHTML = '';
  
  const img = document.createElement('img');
  img.src = src;
  img.alt = 'Preview';
  
  preview.appendChild(img);
};

const clearImagePreview = () => {
  const preview = document.getElementById('image-preview');
  if (!preview) return;
  preview.innerHTML = '';
};

const showLoadingState = () => {
  const preview = document.getElementById('image-preview');
  if (!preview) return;
  preview.innerHTML = '<div style="color: #666; font-style: italic;">Loading...</div>';
};

const hideLoadingState = () => {
  const preview = document.getElementById('image-preview');
  if (!preview) return;
  preview.innerHTML = '';
};

const isValid = (val) => {
  return typeof(val) !== 'undefined' && val !== null && val !== 0;
}

const updateCurrentImage = (url, imageType = 'url') => {
  if (!isValidImageUrl(url) && url && imageType === 'url') return;
  const imageData = {image: url, imageType: imageType};
  sendMessage(imageData);
  saveSetting(imageData);
}

let isUpdatingHistory = false;

const saveUrlToHistory = async (url) => {
  if (!url || !url.trim() || !isValidImageUrl(url)) return;
  
  // Don't save base64 data URLs to history
  if (url.startsWith('data:')) return;
  
  // Prevent race conditions
  if (isUpdatingHistory) return;
  isUpdatingHistory = true;
  
  try {
    const getStorageData = () => {
      if (window['is_chrome']) {
        return new Promise((resolve) => {
          browser.storage.local.get(['image_history'], (result) => {
            resolve(result);
          });
        });
      } else {
        return browser.storage.local.get(['image_history']);
      }
    };
    
    const result = await getStorageData();
    let history = result.image_history || [];
    
    // Remove URL if it already exists (to avoid duplicates)
    history = history.filter(item => item.url !== url);
    
    // Add new URL to the beginning of the array
    history.unshift({
      url: url,
      timestamp: Date.now()
    });
    
    // Keep only the last 20 entries
    if (history.length > 20) {
      history = history.slice(0, 20);
    }
    
    // Save updated history
    await new Promise((resolve) => {
      if (window['is_chrome']) {
        browser.storage.local.set({image_history: history}, resolve);
      } else {
        browser.storage.local.set({image_history: history}).then(resolve);
      }
    });
    
    // Update the thumbnail grid
    loadImageHistory();
  } catch (error) {
    console.error('Failed to save URL to history:', error);
    if (error.message && error.message.includes('QUOTA_BYTES')) {
      alert('Storage quota exceeded. Some old entries will be removed.');
      // Try again with fewer entries
      await saveUrlToHistoryWithReducedSize(url);
    }
  } finally {
    isUpdatingHistory = false;
  }
};

const saveUrlToHistoryWithReducedSize = async (url) => {
  try {
    const result = await browser.storage.local.get(['image_history']);
    let history = result.image_history || [];
    
    // Keep only 10 most recent entries when quota exceeded
    history = history.slice(0, 10);
    history.unshift({
      url: url,
      timestamp: Date.now()
    });
    
    await browser.storage.local.set({image_history: history});
    loadImageHistory();
  } catch (error) {
    console.error('Failed to save reduced history:', error);
  }
}

const selectImageFromHistory = (url) => {
  // Update the input field
  const imageInput = document.getElementById('image-url');
  imageInput.value = url;
  
  // Update the current image
  updateCurrentImage(url, 'url');
  
  // Update selected state in thumbnails
  updateThumbnailSelection(url);
  
  // Save to history (moves to top)
  saveUrlToHistory(url);
}

const updateThumbnailSelection = (selectedUrl) => {
  const thumbnails = document.querySelectorAll('.thumbnail');
  thumbnails.forEach(thumbnail => {
    if (thumbnail.src === selectedUrl) {
      thumbnail.classList.add('selected');
    } else {
      thumbnail.classList.remove('selected');
    }
  });
}

const loadImageHistory = () => {
  const gridContainer = document.getElementById('thumbnail-grid');
  
  const getStorageData = () => {
    if (window['is_chrome']) {
      return new Promise((resolve) => {
        browser.storage.local.get(['image_history'], (result) => {
          resolve(result);
        });
      });
    } else {
      return browser.storage.local.get(['image_history']);
    }
  };
  
  getStorageData().then((result) => {
    const history = result.image_history || [];
    
    // Clear existing thumbnails
    gridContainer.innerHTML = '';
    
    if (history.length === 0) {
      gridContainer.innerHTML = '<div class="no-history">No image history yet</div>';
      return;
    }
    
    // Create thumbnails for each URL in history with lazy loading
    history.forEach((item, index) => {
      const thumbnailContainer = document.createElement('div');
      thumbnailContainer.className = 'thumbnail-container';
      
      const thumbnail = document.createElement('img');
      thumbnail.className = 'thumbnail loading';
      thumbnail.title = item.url;
      thumbnail.alt = 'Image thumbnail';
      
      // Lazy load images - only load first 8 immediately
      if (index < 8) {
        thumbnail.src = item.url;
      } else {
        thumbnail.dataset.src = item.url;
        thumbnail.style.backgroundColor = '#f0f0f0';
      }
      
      // Add click handler
      thumbnail.addEventListener('click', () => {
        selectImageFromHistory(item.url);
      });
      
      // Handle loading success
      thumbnail.addEventListener('load', () => {
        thumbnail.classList.remove('loading');
      });
      
      // Handle loading errors with placeholder
      thumbnail.addEventListener('error', () => {
        thumbnail.classList.remove('loading');
        thumbnail.classList.add('error');
        thumbnail.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj48cmVjdCBmaWxsPSIjRjBGMEYwIiB3aWR0aD0iNjAiIGhlaWdodD0iNjAiLz48dGV4dCBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiM5OTkiPjx0c3BhbiB4PSIxMiIgeT0iMzMiPkVycm9yPC90c3Bhbj48L3RleHQ+PC9nPjwvc3ZnPg==';
        thumbnail.title = 'Failed to load: ' + item.url;
      });
      
      thumbnailContainer.appendChild(thumbnail);
      gridContainer.appendChild(thumbnailContainer);
    });
    
    // Set up intersection observer for lazy loading
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            delete img.dataset.src;
            observer.unobserve(img);
          }
        }
      });
    });
    
    // Observe all lazy-loaded images
    gridContainer.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
    
    // Update selection state
    const currentUrl = document.getElementById('image-url').value;
    updateThumbnailSelection(currentUrl);
  });
}

if(window['browser'] === undefined) {
  window['browser'] = chrome;
  window['is_chrome'] = true;
} else {
  window['is_chrome'] = false;
}


const isactive_input = document.getElementById('isactive');
const size_input = document.getElementById('size');
const image_input = document.getElementById('image-url');
const image_file_input = document.getElementById('image-file');
const use_url_radio = document.getElementById('use-url');
const use_file_radio = document.getElementById('use-file');

const applySettings = () => {
  const processResults = (results) => {
    console.log(results);
    const is_active = results['is_active'] || false;
    const size = results['size'] || 150;
    const image = isValid(results['image']) ? results['image'] : 'http://pngimg.com/uploads/face/face_PNG5660.png';
    const imageType = results['imageType'] || 'url';
    
    if (isactive_input) isactive_input.checked = is_active;
    if (size_input) size_input.value = size;
    
    // Set up radio buttons and inputs based on imageType
    if (imageType === 'file' && image_file_input && use_file_radio) {
      use_file_radio.checked = true;
      if (image_input) image_input.disabled = true;
      image_file_input.disabled = false;
      showImagePreview(image);
    } else {
      if (use_url_radio) use_url_radio.checked = true;
      if (image_input) {
        image_input.disabled = false;
        image_input.value = image;
      }
      if (image_file_input) image_file_input.disabled = true;
      clearImagePreview();
    }
    
    sendMessage({is_active: is_active});
    sendMessage({size: size});
    sendMessage({image: image, imageType: imageType});
    
    // Save current image to history if it's valid and is a URL
    if (image && image.trim() && imageType === 'url' && isValidImageUrl(image)) {
      saveUrlToHistory(image);
    }
  };
  
  if(window['is_chrome']) {
    browser.storage.local.get(null, processResults);
  } else {
    browser.storage.local.get(null).then(processResults);
  }
}


const init = () => {
  // Add null checks for all DOM elements
  if (isactive_input) isactive_input.addEventListener('change', toggleIsActive);
  if (size_input) size_input.addEventListener('change', changeSize);
  if (image_input) image_input.addEventListener('change', changeImage, false);
  if (image_file_input) image_file_input.addEventListener('change', handleFileSelect, false);
  if (use_url_radio) use_url_radio.addEventListener('change', changeImageType);
  if (use_file_radio) use_file_radio.addEventListener('change', changeImageType);
  applySettings();
  loadImageHistory();
}

init();
