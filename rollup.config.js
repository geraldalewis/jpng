import uglify from 'rollup-plugin-uglify';
import { minify } from 'uglify-es';

let pkg = require('./package.json');

export default {
  entry: 'lib/jpng.js',
  dest: pkg.main,
  format: 'iife',
  moduleName: 'jpng',
  plugins: [uglify({}, minify)]
};