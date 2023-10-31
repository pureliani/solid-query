import { defineConfig } from 'tsup'

export default defineConfig({
    entry: ['src/index.ts'],
    minify: true,   
    format: "esm",
    sourcemap: true,
    treeshake: true,
    clean: true
})
