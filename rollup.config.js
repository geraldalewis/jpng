import uglify from 'rollup-plugin-uglify';

let pkg = require('./package.json');

export default {
  entry: 'lib/jpng.js',
  dest: pkg.main,
  format: 'umd',
  moduleName: 'jpng',
  plugins: [uglify()]
};