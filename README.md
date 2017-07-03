# jpng

`jpng` can reduce the size of some PNG files by 70-90%. It works by converting transparency data to a greyscale matte and then applying JPG compression. This library converts the JPG back into a PNG for display on a webpage. [To create a jpng, visit the webapp](http://geraldalewis.com/jpng/).

To let the library automatically convert `<img>` elements, [see the jpng-auto section](#jpng-auto). e.g.,
```html
<img
  src="example-jpng.jpg" 
  width="100"
  height="100"
  data-jpng-auto="true"
>
```


To convert programmatically (useful if you're using a framework with a virtual DOM (like React or Vue), [see the jpng section](#jpng.js). e.g.,
```javascript
jpng('example-jpng.jpg', 100, 100, (record) => {
  console.log(record.src); // "data:image/png;..."
});
```



## jpng.js

### installation
Install via npm

```bash
npm install jpng
```

or yarn

```bash
yarn add jpng
```

...or from the CDN

```html
<script src="https://unpkg.com/jpng@latest/dist/jpng.iife.min.js"></script>
<!-- or the non-minified version -->
<script src="https://unpkg.com/jpng@latest/dist/jpng.iife.js"></script>
```

### usage

Import as an es6 module if installed with npm or yarn.

```javascript
import jpng from 'jpng'
```

*(note: jpng-auto can be imported via `import jpng from 'jpng/auto'`)*

The `jpng` function takes a `src`, loads the jpng file asynchronously, and re-creates the PNG. It returns a record object that gets updated as the process progresses (`record.src` will ultimately point to a `dataURL` representing the PNG).

```javascript
  const record = jpng('example-jpng.jpg', 100, 100, (record) => {
    if (record.error) console.warn(record.error);
    console.log(record.src); // "data:image/png;..."
  });
  console.log(record.state); // "loading"
```

This makes it possible to use it with frameworks like Vue:

```html
<jpng-img
  :src="example.src"
  :width="example.width"
  :height="example.height"
  :data-jpng="example.state"
></jpng-img>
```
```javascript
import jpng from 'jpng';

export default {
  name: 'some-component',
  data: function(){
    return {
      example: jpng("example-jpng.jpg", 100, 100)
    };
  }
}
```

It can be used sans-framework, of course:

```javascript
  const record = jpng('example-jpng.jpg', 100, 100, (record) => {
    if (record.error) console.warn(record.error);
    const img = new Image();
    img.width = record.width;
    img.height = record.height;
    img.src = record.src; // "data:image/png;..."
    document.body.appendChild(img);
  });
```

####jpng params####
`src`: `String` **required**; src for jpng file.
`width` and `height`: `uint` **required**; dimensions of the *original* PNG.
`callback`: `(record:Object) => void` *optional*; a callback invoked with the jpng record after an error occurs or processing has finished.

####jpng return####
A record object is returned for scenarios where your environment supports observing vanilla JS objects (like Vue).

```javascript
{ 
  width: 100,
  height: 100,
  error: null,
  src: <blankPNG>, 
  state: 'loading'
}
```
`record.src` is initially set to the `dataURL` of a 4x4 transparent PNG. Once processing is complete, it is updated with the `dataURL` of the composited jpng image.

`record.state` is updated when an error occurs (`'error'`) and when processing is complete (`'ready'`).

`record.error` is updated if the src cannot be loaded; otherwise it is `null`.

## jpng-auto

The `jpng-auto` script will look for any `<img>` elements with a `data-jpng-auto` attribute set to `"true"` and process them.

### jpng-auto usage

Add the jpng-auto script anywhere in your html (note the `async` attribute):

```html
<script async src="https://unpkg.com/jpng@latest/dist/jpng-auto.iife.min.js"></script>
```

*(note: jpng-auto can be imported via `import jpng from 'jpng/auto'`)*

Then embed the image with the following **required** attributes:

  * The `src` of the jpng.
  * The `width` and `height` of the *original* png.
  * `data-jpng-auto` attribute set to `true`.

```html
<img
  src="example-jpng.jpg" 
  width="100"
  height="100"
  data-jpng-auto="true"
>
```

#### jpng-auto updating
Any images added to the DOM *after* `DOMContentLoaded` won't automatically be converted. Either call `jpng.update()` after new images are inserted *or* add an `onload` handler to the `<img>`.

```html
<img
  onload="typeof jpng !== 'undefined' && jpng.replaceSrc(this, 100, 100)"
  src="example-jpng.jpg" 
  width="100"
  height="100"
  data-jpng-auto="true"
>
```

*(The `!== 'undefined'` test guards against `ReferenceError`s.)*

The `replaceSrc` method takes the `<img>` element as its first arg, and the width and height of the original png as its second and third args respectively.

```javascript
jpng.replaceSrc( this:HTMLImageElement, width:uint, height:uint )
```


#### CSS: Hide the image while it loads
You might see a flash of the non-composited image before it has finished processing. To hide it, include a CSS snippet like this:

```css
img[data-jpng="loading"], img[data-jpng-auto="true"] {
  visibility: hidden;
}
```

The full list of attribute selectors:

```css
img[data-jpng="loading"],
img[data-jpng="ready"],
img[data-jpng="error"],
img[data-jpng-auto="true"],
img[data-jpng-auto="false"] {
}
```

---

&#x2764; @geraldalewis
