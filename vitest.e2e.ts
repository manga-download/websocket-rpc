import { defineConfig } from 'vite';

export default defineConfig({
    test: {
        include: [
            './test/**/*.e2e.ts'
        ],
        fileParallelism: false,
    },
});