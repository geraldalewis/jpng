var pngToJPNGBlob = (function(){

  var supported = HTMLCanvasElement && 
                  (HTMLCanvasElement.prototype.toBlob || (atob && Uint8Array));
  
  function toBlob(canvas, callback, type, quality){
    if (canvas.toBlob) return canvas.toBlob(callback, type, quality);
    var dataURL = canvas.toDataURL(type, quality),
        string = atob(dataURL.split(',')[1]),
        i, len = string.length, data = new Uint8Array(len);

    for (i = 0; i < len; i++) data[i] = string.charCodeAt(i);
    
    callback( new Blob([ data ], { type: type } ));
  }
  
  function context2d(w, h){
    var canvas = document.createElement('canvas'),
        ctx = canvas.getContext('2d');
    canvas.width = w; canvas.height = h;
    return ctx;
  }
  
  function createRGB(png){
    var w = png.width, h = png.height,
        ctx = context2d(w, h),
        image, data, i, len;
  
    ctx.drawImage(png, 0, 0);
  
    image = ctx.getImageData(0, 0, w, h);
    data = image.data; len = data.length;
  
    for (i = 0; i < len; i += 4) data[i+3] = 255;
    ctx.putImageData(image, 0, 0);
    return ctx;
  }
  
  function createAlpha(png){
    var w = png.width, h = png.height,
        a = context2d(w, h);
  
    a.fillStyle = 'rgb(255,255,255)';
    a.fillRect(0, 0, w, h);
    a.globalCompositeOperation = 'xor';
    a.drawImage(png, 0, 0);
  
    return a;
  }
  
  function createJPNGBlob(png, quality, callback){
    var w = png.width, h = png.height,
        rgb = createRGB(png),
        a = createAlpha(png),
        vertical = w >= h,
        width  = vertical ? w : w<<1,
        height = vertical ? h<<1 : h,
        x = vertical ? 0 : w,
        y = vertical ? h : 0,
        ctx = context2d(width, height);
    
    if (quality === undefined || (quality !== quality)) quality = 0.7;
    else if (quality < 0) quality = 0;
    else if (quality > 1) quality = 1;
    
    ctx.drawImage(rgb.canvas, 0, 0);
    ctx.drawImage(a.canvas, x, y);
    
    function onblob(blob){
      callback({
        png: png,
        blob: blob,
        quality: quality,
        x: x, y: y, w: w, h: h
      })
    }
    toBlob(ctx.canvas, onblob, 'image/jpeg', quality);
  }

  function calibrate(src, kb, callback){
    var bytes = kb * 1024,
        lower = 0, upper = 1;

    if (!supported) throw new Error("JPNG: environment not supported");

    function oncomplete(out){
      var size = out.blob.size,
          diff = Math.abs(size - bytes),
          q = out.quality;
      // if it's within 512 bytes of the target kb, good to go:
      if (diff <= 512) return callback(q);
      if (size < bytes) lower = q;
      else upper = q;
      // if the difference between upper and lower is too slim, abort and return lower.
      if ((upper - lower) <= 0.01) return callback(lower);
      test( (lower + upper) / 2 );
    }

    function test(quality){
      pngToJPNGBlob(src, quality, oncomplete);
    }

    test( (lower + upper) / 2 );
  }
  
  function pngToJPNGBlob(src, quality, callback){
    var png = new Image();
    if (!supported) throw new Error("JPNG: environment not supported");
    png.onload = function(){
      createJPNGBlob(png, quality, callback);
    }
    png.src = src;
  }

  pngToJPNGBlob.supported = supported;
  pngToJPNGBlob.calibrate = calibrate;
  
  return pngToJPNGBlob;
}());