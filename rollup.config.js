import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs'
import resolve from 'rollup-plugin-node-resolve'

export default {
  input: 'src/index.js',
  output: {
    file: 'test/datastore.js',
    format: 'umd',
    name: 'datastore',
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
      commonjs()
    ]
}