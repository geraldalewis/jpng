var jpng = (function(){
  
  function context2d(w, h){
    var canvas = document.createElement('canvas'),
        ctx = canvas.getContext('2d');
    canvas.width = w; canvas.height = h;
    return ctx;
  }
  
  function copyRegion(img, x, y, w, h){
    var ctx = context2d(w, h);
    ctx.drawImage(img, x, y, w, h, 0, 0, w, h);
    return ctx.canvas;
  }
  
  function composite(rgb, alpha, w, h){
    var rgba = context2d(w, h),
        a = context2d(w, h),
        image, data;
    
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
    var rgb = copyRegion(img, 0, 0, w, h),
        alpha = copyRegion(img, x, y, w, h);
    return composite(rgb, alpha, w, h);
  }

  function onjpngswapped(event){
    var img = event.target;
    img.removeEventListener('load', onjpngswapped);
    // set a timeout before setting the img's ready state to true
    // to eliminate the flash of the non-merged jpng we see on Firefox.
    setTimeout(function(){ img.setAttribute('data-jpng', 'ready'); }, 0);
  }

  function processIMG(img){
    var x = 0, y = 0, w, h;
    if (img.getAttribute('data-jpng') !== 'loading') return;
    // set the 'data-jpng' attribute to "processing" so that the img is not reprocessed.
    img.setAttribute('data-jpng', 'processing');
    w = img.naturalWidth;
    h = img.naturalHeight;
    if (img.getAttribute('data-jpng-vertical') == 'true') { h = h >> 1; y = h; }
    else { w = w >> 1; x = w; }
    // set the src attribute the the dataURL of the composited rgb and alpha images
    // this way, we don't have to completely replace the element entirely.
    img.addEventListener('load', onjpngswapped);
    img.src = jpngToCanvas(img, x, y, w, h).toDataURL('image/png', 1.0);
  }

  function createIMG(src, vertical, w, h){
    var img = document.createElement('img');
    if (w) img.width = w;
    if (h) img.height = h;
    img.setAttribute('data-jpng', 'loading');
    img.setAttribute('data-jpng-vertical', vertical ? 'true' : 'false');
    img.addEventListener('load', onimgloaded);
    img.src = src;
    return img;
  }

  function onimgloaded(event){
    var img = event.target;
    img.removeEventListener('load', onimgloaded);
    processIMG(img);
  }

  function update(){
    var images = document.querySelectorAll('img[data-jpng="loading"]'),
        img, i, len = images.length;
    for (i = 0; i < len; i++) {
      img = images[i];
      if (img.complete) processIMG(img);
      else img.addEventListener('load', onimgloaded);
    }
  }

  function jpng(img, x, y, w, h){
    return jpngToCanvas(img, x, y, w, h);
  }

  function onupdate(){
    update();
    if (document.readyState === 'complete') {
      document.removeEventListener('readystatechange', onupdate);
    }
  }
  if (document.readyState === 'complete') update();
  else document.addEventListener('readystatechange', onupdate);
  
  jpng.update = update;
  jpng.createIMG = createIMG;
  jpng.processIMG = processIMG;

  return jpng;
}());