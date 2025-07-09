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

const changeImage = (e) => {
  console.log(e);
  const url = e.target.value;
  updateCurrentImage(url);
  if (url && url.trim()) {
    saveUrlToHistory(url);
  }
};

const isValid = (val) => {
  return typeof(val) !== 'undefined' && val !== null && val !== 0;
}

const updateCurrentImage = (url) => {
  const imageData = {image: url};
  sendMessage(imageData);
  saveSetting(imageData);
}

const saveUrlToHistory = (url) => {
  if (!url || !url.trim()) return;
  
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
    saveSetting({image_history: history});
    
    // Update the thumbnail grid
    loadImageHistory();
  });
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
    
    // Create thumbnails for each URL in history
    history.forEach((item) => {
      const thumbnail = document.createElement('img');
      thumbnail.src = item.url;
      thumbnail.className = 'thumbnail';
      thumbnail.title = item.url;
      
      // Add click handler
      thumbnail.addEventListener('click', () => {
        selectImageFromHistory(item.url);
      });
      
      // Handle loading errors
      thumbnail.addEventListener('error', () => {
        thumbnail.style.display = 'none';
      });
      
      gridContainer.appendChild(thumbnail);
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
  if(window['is_chrome']) {
    browser.storage.local.get(null, (results) => {
      console.log(results);
      const is_active = results['is_active'] || false;
      const size = results['size'] || 150;
      // const image = isValid(results['image']) ? results['image'] : browser.extension.getURL('images/face.png');
      const image = isValid(results['image']) ? results['image'] : 'http://pngimg.com/uploads/face/face_PNG5660.png';
      isactive_input.checked = is_active;
      size_input.value = size;
      image_input.value = image;
      sendMessage({is_active: is_active});
      sendMessage({size: size});
      sendMessage({image: image});
      // Save current image to history if it's valid
      if (image && image.trim()) {
        saveUrlToHistory(image);
      }
    });
  } else {
    let gettingAllStorageItems = browser.storage.local.get(null);
    gettingAllStorageItems.then((results) => {
      console.log(results);
      const is_active = results['is_active'] || false;
      const size = results['size'] || 150;
      // const image = isValid(results['image']) ? results['image'] : browser.extension.getURL('images/face.png');
      const image = isValid(results['image']) ? results['image'] : 'http://pngimg.com/uploads/face/face_PNG5660.png';
      isactive_input.checked = is_active;
      size_input.value = size;
      image_input.value = image;
      sendMessage({is_active: is_active});
      sendMessage({size: size});
      sendMessage({image: image});
      // Save current image to history if it's valid
      if (image && image.trim()) {
        saveUrlToHistory(image);
      }
    });
  }
}


const init = () => {
  isactive_input.addEventListener('change', toggleIsActive);
  size_input.addEventListener('change', changeSize);
  image_input.addEventListener('change', changeImage, false);
  applySettings();
  loadImageHistory();
}

init();
