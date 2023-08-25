import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';

export default {
  input: 'src/index.ts',
  output: {
    file: 'dist/index.js',
    sourcemap: true,
    format: 'esm'
  },
  external: ['solid-js'],
  plugins: [
    typescript(),
    resolve(),
    terser()
  ]
};
