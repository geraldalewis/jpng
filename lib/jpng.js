const blankPNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAD0lEQVQYV2NkQAOMpAsAAADuAAUtpgPEAAAAAElFTkSuQmCC';

function context2d(w, h){
  const canvas = document.createElement('canvas'),
        ctx = canvas.getContext('2d');
  canvas.width = w; canvas.height = h;
  return ctx;
}

function copyRegion(img, x, y, w, h){
  const ctx = context2d(w, h);
  ctx.drawImage(img, x, y, w, h, 0, 0, w, h);
  return ctx.canvas;
}

function composite(rgb, alpha, w, h){
  const rgba = context2d(w, h),
        a = context2d(w, h);
  var image, data;
  
  a.drawImage(alpha, 0, 0);
  image = a.getImageData(0, 0, w, h);
  data = image.data;
  
  // Shift the green channel (`1`) into the alpha channel.
  // Use the green channel as it's likely the least compressed.
  data.set(data.subarray(1, data.length - 3), 4);
  a.putImageData(image, 0, 0);
  
  rgba.drawImage(rgb, 0, 0);
  rgba.globalCompositeOperation = 'xor';
  rgba.drawImage(a.canvas, 0, 0);
  
  // cleanup
  a.canvas.width = a.canvas.height = 0;
  
  return rgba.canvas;
}

function jpngToCanvas(img, x, y, w, h){
  var rgb   = copyRegion(img, 0, 0, w, h),
      alpha = copyRegion(img, x, y, w, h);
  return composite(rgb, alpha, w, h);
}

function resetSrc(img, w, h){
  const x = 0, y = h,
        record = {
          src: img.src,
          width:  w,
          height: h,
          state: 'loading'
        },
        canvas = jpngToCanvas(img, x, y, w, h);
  // give ourselves a little breather before calling toDataURL
  setTimeout(() => {
    const dataURL = canvas.toDataURL('image/png');
    canvas.width = 0; canvas.height = 0; // cleanup.
    img.src = (record.url = dataURL);
    // set a timeout before setting the ready state to true
    // to eliminate the flash of the non-merged jpng we see on Firefox.
    setTimeout(() => {
      img.setAttribute('data-jpng', (record.state = 'ready'));
    }, 0);
  });
  return record;
}

function toDataURL(src, w, h, resolve, reject){
  const x = 0, y = h, 
        img = new Image(),
        record = {
          src:    blankPNG,
          width:  w,
          height: h,
          state: 'loading'
        };
  img.onload = () => {
    const dataURL = jpngToCanvas(img, x, y, w, h).toDataURL('image/png');
    img.onload = img.onerror = null; img.src = ''; // cleanup.
    record.src = dataURL;
    // set a timeout before setting the ready state to true
    // to eliminate the flash of the non-merged jpng we see on Firefox.
    setTimeout(() => { record.state = 'ready'; }, 0);
    if (resolve) resolve(dataURL);
  };
  img.onerror = (e) => {
    img.onload = img.onerror = null; img.src = ''; // cleanup.
    if (reject) reject(e);
    else if (resolve) resolve(null, e);
  };
  img.src = src;
  return record;
}

function toCanvas(img, w, h){
  const x = 0, y = h;
  return jpngToCanvas(img, x, y, w, h);
}

function replace(img, w, h){
  const x = 0, y = h,
        canvas = jpngToCanvas(img, x, y, w, h),
        parent = img.parentNode;
  if (parent) parent.replaceChild(canvas, img);
  img.setAttribute('data-jpng', 'ready');
  return canvas;
}

function auto(){
  function onimgloaded(event){
    const img = event.target;
    img.removeEventListener('load', onimgloaded);
    replace(img, img.getAttribute('width'), img.getAttribute('height'));
  }
  function update(){
    const images = document.querySelectorAll('img[data-jpng="auto"]'),
          len = images.length;
    for (let i = 0, img = null; i < len; i++) {
      img = images[i];
      img.setAttribute('data-jpng', 'loading');
      if (img.complete) onimgloaded({ target: img });
      else img.addEventListener('load', onimgloaded);
    }
  }
  function onstate(){
    update();
    if (document.readyState === 'complete') {
      document.removeEventListener('readystatechange', onstate);
    }
  }
  if (document.readyState === 'complete') update();
  else document.addEventListener('readystatechange', onstate);
}

const jpng = {
  resetSrc,
  toDataURL,
  toCanvas,
  replace,
  auto
};

export default jpng;