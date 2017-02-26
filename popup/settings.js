const onError = (error) => {
  console.log(`Error: ${error}`);
}

const sendMessage = (content) => {
  browser.tabs.executeScript(null, {
    file: "/content_scripts/face.js"
  });

  const gettingActiveTab = browser.tabs.query({active: true, currentWindow: true});
  gettingActiveTab.then((tabs) => {
    browser.tabs.sendMessage(tabs[0].id, content);
  });
}

const saveSetting = (val) => {
  let setting  = browser.storage.local.set(val);
  setting.then(null, onError);
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
  const url = {image: e.target.value};
  sendMessage(url);
  saveSetting(url);
};

const isValid = (val) => {
  return typeof(val) !== 'undefined' && val !== null && val !== 0;
}


const isactive_input = document.getElementById('isactive');
const size_input = document.getElementById('size');
const image_input = document.getElementById('image-url');

const applySettings = () => {
  let gettingAllStorageItems = browser.storage.local.get(null);
  gettingAllStorageItems.then((results) => {
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
  });
}

const init = () => {
  isactive_input.addEventListener('change', toggleIsActive);
  size_input.addEventListener('change', changeSize);
  image_input.addEventListener('change', changeImage, false);
  applySettings();
}

init();
