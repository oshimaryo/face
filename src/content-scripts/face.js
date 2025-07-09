// Initialize browser compatibility
if(window['browser'] === undefined) {
  window['browser'] = chrome;
  window['is_chrome'] = true;
} else {
  window['is_chrome'] = false;
}


const mouseMove = (e) => {
  e.preventDefault();
  changePosition(e.pageX, e.pageY);
};

const changePosition = (x, y) => {
  const faceImg = document.querySelector('img.face-extension-img');
  if (faceImg && faceImg.classList.contains('is-moving')) {
    const w = faceImg.clientHeight;
    const h = faceImg.clientWidth;
    faceImg.style.top = (y - h/2) + 'px';
    faceImg.style.left = (x - w/2) + 'px';
  }
};

const clickImage = (e) => {
  const faceImg = e.target;
  if (faceImg.classList.contains('is-moving')) {
    faceImg.classList.add('is-not-moving');
    faceImg.classList.remove('is-moving');
  }
  else {
    faceImg.classList.add('is-moving');
    faceImg.classList.remove('is-not-moving');
  }
};

// Create the face image element
const img = document.createElement('img');
img.classList.add('face-extension-img');
img.classList.add('is-moving');
img.setAttribute('style', 'display: none; position:absolute; width: 150px; height: auto; z-index: 9999999999999999; cursor: pointer;');
document.body.appendChild(img);

// Add event listeners
document.body.addEventListener('mousemove', mouseMove);
img.addEventListener('click', clickImage);

const changeStatus = (request, sender, sendResponse) => {
  const isNotNull = (val) => {
    return (typeof(val) !== 'undefined' && val !== null);
  };

  const faceImg = document.querySelector('img.face-extension-img');
  if (!faceImg) {
      return;
  }


  if(isNotNull(request.is_active)) {
    faceImg.style.display = request.is_active ? 'block' : 'none';
  }
  if (isNotNull(request.size)) {
    faceImg.style.width = request.size + 'px';
  }
  if (isNotNull(request.image)) {
    const url = request.image;
    faceImg.setAttribute('src', url);
  }
};

browser.runtime.onMessage.addListener(changeStatus);

// Initialize face with saved settings
const initializeFace = async () => {
  try {
    const results = await browser.storage.local.get(['is_active', 'size', 'image']);
    
    const is_active = results.is_active !== undefined ? results.is_active : true;
    const size = results.size || 150;
    const image = results.image || 'http://pngimg.com/uploads/face/face_PNG5660.png';
    
    changeStatus({ is_active, size, image });
  } catch (error) {
    console.error('Error initializing face:', error);
    // Set default values if storage access fails
    changeStatus({
      is_active: true,
      size: 150,
      image: 'http://pngimg.com/uploads/face/face_PNG5660.png'
    });
  }
};

// Wait for DOM to be ready before initializing
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeFace);
} else {
  initializeFace();
}