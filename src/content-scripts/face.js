const mouseMove = (e) => {
  e.preventDefault();
  changePosition(e.pageX, e.pageY);
};

const changePosition = (x, y) => {
  if (img.classList.contains('is-moving')) {
    const w = img.clientHeight;
    const h = img.clientWidth;
    img.style.top = (y - h/2) + 'px';
    img.style.left = (x - w/2) + 'px';
  }
};

const clickImage = (e) => {
  if (img.classList.contains('is-moving')) {
    img.classList.add('is-not-moving');
    img.classList.remove('is-moving');
  }
  else {
    img.classList.add('is-moving');
    img.classList.remove('is-not-moving');
  }
};


if(window['browser'] === undefined) {
  window['browser'] = chrome;
  window['is_chrome'] = true;
} else {
  window['is_chrome'] = false;
}

const img = document.createElement('img');
img.classList.add('is-moving');
img.setAttribute('style', 'display: none; position:absolute; width: 150px; height: auto; z-index: 9999999999999999; cursor: pointer;');

document.body.appendChild(img);
document.body.addEventListener('mousemove', mouseMove);
img.addEventListener('click', clickImage);

const changeStatus = (request, sender, sendResponse) => {
  const isNotNull = (val) => {
    return (typeof(val) !== 'undefined' && val !== null);
  };

  if(isNotNull(request.is_active)) {
    img.style.display = request.is_active ? 'block' : 'none';
  }
  if (isNotNull(request.size)) {
    img.style.width = request.size + 'px';
  }
  if (isNotNull(request.image)) {
    const url = request.image;
    img.setAttribute('src', url);
  }
};

browser.runtime.onMessage.addListener(changeStatus);