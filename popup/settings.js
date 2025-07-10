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
  const url = {image: e.target.value, imageType: 'url'};
  sendMessage(url);
  saveSetting(url);
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
    
    isactive_input.checked = is_active;
    size_input.value = size;
    
    // Set up radio buttons and inputs based on imageType
    if (imageType === 'file') {
      use_file_radio.checked = true;
      image_input.disabled = true;
      image_file_input.disabled = false;
      showImagePreview(image);
    } else {
      use_url_radio.checked = true;
      image_input.disabled = false;
      image_file_input.disabled = true;
      image_input.value = image;
      clearImagePreview();
    }
    
    sendMessage({is_active: is_active});
    sendMessage({size: size});
    sendMessage({image: image, imageType: imageType});
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
}

init();
