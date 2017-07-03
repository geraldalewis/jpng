import jpng from './jpng';

function wait(cb){ setTimeout(cb, 0); }

function ensureLoaded(img, cb){
  const onload  = () => { img.onload = img.onerror = null; cb(img, null); },
        onerror = () => { img.onload = img.onerror = null; cb(null, img); };
  if (img.complete) {
    img.onload = img.onerror = null;
    if (img.naturalWidth) wait(onload);
    else wait(onerror); // if error, naturalWidth will equal 0.
  } else {
    img.onload  = onload;
    img.onerror = onerror;
    img.setAttribute('data-jpng', 'loading');
  }
}

function resetSrc(img, w, h){
  img.setAttribute('data-jpng-auto', 'false');
  if (img.src.indexOf('data:image/png;') === 0) return;
  ensureLoaded(img, (loadedImg, error) => {
    if (error || w === 0 || h === 0) img.setAttribute('data-jpng', 'error');
    else {
      let x = 0, y = h;
      const canvas = jpng.fromRect(img, x, y, w, h),
            dataURL = canvas.toDataURL('image/png');
      canvas.width = canvas.height = 0; // cleanup.
      img.src = dataURL;
      wait( () => { img.setAttribute('data-jpng', 'ready'); } );
    }
  });
}

function update(){
  const images = document.querySelectorAll('img[data-jpng-auto="true"]'),
        len = images.length;
  for (let i = 0, img = null; i < len; i++) {
    img = images[i];
    resetSrc(img, img.width|0, img.height|0);
  }
}

update();
document.addEventListener('readystatechange', update);

export default Object.defineProperties(jpng, {
  resetSrc: { value: resetSrc },
  update: { value: update }
});