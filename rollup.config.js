import resolve from 'rollup-plugin-node-resolve';
import cjs from 'rollup-plugin-cjs-es';
import uglify from 'rollup-plugin-uglify';
import camelcase from 'camelcase';

const {COMPRESS, npm_package_name} = process.env;

export default {
	input: 'index.js',
	output: {
    file: `dist/${npm_package_name}${COMPRESS?".min":""}.js`,
    format: 'iife',
    name: camelcase(npm_package_name),
    sourcemap: true
  },
	plugins: [resolve(), cjs(), COMPRESS && uglify()].filter(Boolean)
};
