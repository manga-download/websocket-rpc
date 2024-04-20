import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        ssr: true,
        emptyOutDir: true,
        outDir: resolve(__dirname, 'dist'),
        lib: {
            entry: [
                //resolve(__dirname, 'src', '_index.ts'),
                resolve(__dirname, 'src', 'client.ts'),
                resolve(__dirname, 'src', 'server.ts'),
            ],
            formats: [ 'es', 'cjs' ],
        },
    },
    test: {},
});