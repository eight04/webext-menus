import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import uglify from 'rollup-plugin-uglify';
import {minify} from 'uglify-es';

const {COMPRESS, npm_package_name} = process.env;
const file = `dist/${npm_package_name}${COMPRESS?".min":""}.js`;
const plugins = [resolve(), commonjs()];

if (COMPRESS) {
  plugins.push(uglify({}, minify));
}

export default {
	input: 'index.js',
	output: {
    file,
    format: 'iife',
    name: 'webextMenus',
    sourcemap: true
  },
	plugins
};
