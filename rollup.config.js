import buble from 'rollup-plugin-buble';
import uglify from 'rollup-plugin-uglify';

let pkg = require('./package.json');

export default {
  entry: 'lib/jpng.js',
  dest: pkg.main,
  format: 'iife',
  moduleName: 'jpng',
  plugins: [buble(), uglify()]
};