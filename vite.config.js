import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';

export default defineConfig({
    base: '/guess-tune-game/', // ⚠️ Replace with your GitHub repo name
    plugins: [solidPlugin()],
    server: {
        port: 3000,
    },
    build: {
        target: 'esnext',
    },
});
