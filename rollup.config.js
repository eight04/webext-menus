import cjs from 'rollup-plugin-cjs-es';
import {terser} from 'rollup-plugin-terser';
import camelcase from 'camelcase';

const {npm_package_name} = process.env;

export default [
  config(),
  config(true)
];

function config(COMPRESS) {
  return {
    input: 'index.js',
    output: {
      file: `dist/${npm_package_name}${COMPRESS?".min":""}.js`,
      format: 'iife',
      name: camelcase(npm_package_name),
      sourcemap: true
    },
    plugins: [cjs(), COMPRESS && terser()]
  };
}