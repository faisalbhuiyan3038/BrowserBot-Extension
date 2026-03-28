import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'BrowserBot',
    description: 'AI-powered browser automation — group tabs, ask about pages, and more.',
    permissions: ['tabs', 'tabGroups', 'storage'],
    host_permissions: ['<all_urls>']
  }
});
