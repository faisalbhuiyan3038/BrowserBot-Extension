import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react','@wxt-dev/auto-icons'],
  manifest: {
    name: 'BrowserBot',
    description: 'AI-powered browser automation — group tabs, ask about pages, and more.',
    permissions: ['tabs', 'tabGroups', 'storage', 'scripting'],
    host_permissions: ['<all_urls>'],
    commands: {
      _execute_action: {
        suggested_key: {
          default: 'Ctrl+Shift+B',
          mac: 'Command+Shift+B'
        },
        description: 'Open BrowserBot popup'
      },
      toggle_ask_page: {
        suggested_key: {
          default: 'Ctrl+Shift+A',
          mac: 'Command+Shift+A'
        },
        description: 'Toggle Ask Page on current tab'
      }
    }
  }
});
