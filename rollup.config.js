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
	plugins: [cjs(), COMPRESS && uglify()].filter(Boolean)
};
