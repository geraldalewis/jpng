const rollup = require('rollup'),
      buble = require('rollup-plugin-buble'),
      uglify = require('rollup-plugin-uglify');

function build(name, iife, minify){
  const dest = `dist/${name}${iife ? '.iife' : ''}${minify ? '.min' : ''}.js`,
        entry = `lib/${name}.js`,
        plugins = [buble()],
        format = iife ? 'iife' : 'es';

  if (minify) plugins.push(uglify());

  let promise = rollup.rollup({
    entry,
    plugins
  }).then( (bundle) => {
    return bundle.write({
      format,
      dest,
      moduleName: 'jpng'
    });
  });

  if (!minify) return promise;
  return promise.then( () => { return build(name, iife, false); } );
}

Promise.all([
  build('jpng', true, true),
  build('jpng', false, false),
  build('jpng-auto', true, true),
  build('jpng-auto', false, false)
])
.then( () => console.log('complete') )
.catch(console.error);