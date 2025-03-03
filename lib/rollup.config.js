import typescript from 'rollup-plugin-typescript2';
import { defineConfig } from 'rollup';

export default defineConfig({
  input: 'index.ts',
  output: [
    {
      file: 'dist/index.js',
      format: 'esm',
      sourcemap: true
    },
    {
      file: 'dist/index.cjs',
      format: 'cjs',
      sourcemap: true
    }
  ],
  external: [],
  plugins: [
    typescript({
      tsconfig: './tsconfig.json',
      useTsconfigDeclarationDir: true,
      clean: true
    })
  ]
});