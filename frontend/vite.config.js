import { defineConfig } from 'vite';
import { resolve } from 'path';
import fs from 'fs';

function getHtmlEntries(dir, entries = {}) {
    if (!fs.existsSync(dir)) return entries;
    const items = fs.readdirSync(dir);

    items.forEach(item => {
        if (item === 'dist' || item === 'node_modules' || item === '.vite') return;
        const fullPath = resolve(dir, item);
        if (fs.statSync(fullPath).isDirectory()) {
            getHtmlEntries(fullPath, entries);
        } else if (item.endsWith('.html')) {
            const relativePath = fullPath.replace(resolve(__dirname), '').replace(/\\/g, '/').substring(1);
            const name = relativePath.replace(/\.html$/, '').replace(/\//g, '_');
            entries[name] = fullPath;
        }
    });
    return entries;
}

const input = getHtmlEntries(resolve(__dirname));

export default defineConfig({
    base: '/',
    root: resolve(__dirname),
    build: {
        outDir: resolve(__dirname, 'dist'),
        rollupOptions: {
            input
        }
    },
    server: {
        port: 3000,
        open: true
    }
});
