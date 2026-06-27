import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    // Deploys as Vercel Node.js serverless functions (required for the MongoDB driver).
    adapter: adapter({ runtime: 'nodejs20.x' })
  }
};

export default config;
