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
  
  updateCurrentImage(url);
  if (url) {
    saveUrlToHistory(url);
  }
};

const isValid = (val) => {
  return typeof(val) !== 'undefined' && val !== null && val !== 0;
}

const updateCurrentImage = (url) => {
  if (!isValidImageUrl(url) && url) return;
  const imageData = {image: url};
  sendMessage(imageData);
  saveSetting(imageData);
}

let isUpdatingHistory = false;

const saveUrlToHistory = async (url) => {
  if (!url || !url.trim() || !isValidImageUrl(url)) return;
  
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
  updateCurrentImage(url);
  
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

const applySettings = () => {
  const processResults = (results) => {
    console.log(results);
    const is_active = results['is_active'] || false;
    const size = results['size'] || 150;
    const image = isValid(results['image']) ? results['image'] : 'http://pngimg.com/uploads/face/face_PNG5660.png';
    
    if (isactive_input) isactive_input.checked = is_active;
    if (size_input) size_input.value = size;
    if (image_input) image_input.value = image;
    
    sendMessage({is_active: is_active});
    sendMessage({size: size});
    sendMessage({image: image});
    
    // Save current image to history if it's valid
    if (image && image.trim() && isValidImageUrl(image)) {
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
  if (isactive_input) isactive_input.addEventListener('change', toggleIsActive);
  if (size_input) size_input.addEventListener('change', changeSize);
  if (image_input) image_input.addEventListener('change', changeImage, false);
  applySettings();
  loadImageHistory();
}

init();
