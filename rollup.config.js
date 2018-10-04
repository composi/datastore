import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs'
import resolve from 'rollup-plugin-node-resolve'
import minify from 'rollup-plugin-babel-minify'

export default {
  input: 'src/index.js',
  output: {
    file: 'dist/datastore.js',
    format: 'umd',
    name: 'datastore',
    sourcemap: true,
    sourcemapFile: 'dist/datastore.js.map',
    globals: {
      composi: 'datastore'
    }
  },
  plugins:
    [
      babel({
        exclude: 'node_modules/**',
        runtimeHelpers: true
      }),
      resolve({
        jsnext: true,
        main: true,
        browser: true
      }),
      commonjs(),
      minify({
        mangle: true,
        comments: false
      })
    ]
}