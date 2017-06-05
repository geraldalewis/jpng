import uglify from 'rollup-plugin-uglify';

export default {
  entry: 'lib/jpng.js',
  format: 'umd',
  dest: 'dist/jpng.js',
  plugins: [
    uglify()
  ]
};