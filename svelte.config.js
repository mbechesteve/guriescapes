import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    // Deploys as Vercel Node.js serverless functions (required for the MongoDB driver).
    adapter: adapter({ runtime: 'nodejs20.x' }),
    // Inline all CSS into the HTML so first paint doesn't block on separate
    // stylesheet requests (the largest bundle is ~40KB, so this covers all).
    inlineStyleThreshold: 150 * 1024
  }
};

export default config;
