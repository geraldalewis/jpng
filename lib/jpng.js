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

function composite(rgb, alpha){
  const w = rgb.width,
        h = rgb.height,
        rgba = context2d(w, h),
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

function fromRect(img, x, y, w, h){
  const rgb   = copyRegion(img, 0, 0, w, h),
        alpha = copyRegion(img, x, y, w, h);
  return composite(rgb, alpha);
}

function jpng(src, w, h, cb){
  const img = new Image(),
        record = { 
          width: w, height: h,
          error: null,
          src: blankPNG, 
          state: 'loading'
        };
  img.onload = () => {
    img.onload = img.onerror = null;
    let x = 0, y = h;
    const canvas = fromRect(img, x, y, w, h);
    record.src = canvas.toDataURL('image/png');
    canvas.width = canvas.height = 0; // cleanup.
    setTimeout(() => { 
      record.state = 'ready';
      cb && cb(record);
    }, 0);
  };
  img.onerror = () => {
    img.onload = img.onerror = null;
    record.state = 'error';
    record.error = `Could not load image ${src}`;
    cb && cb(record);
  };
  img.src = src;
  return record;
}

export default Object.defineProperties(jpng, {
  composite: { value: composite },
  fromRect:  { value: fromRect  }
});