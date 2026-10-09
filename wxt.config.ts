import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react', '@wxt-dev/auto-icons'],
  autoIcons: {
    baseIconPath: 'assets/icon.png',
    sizes: [16, 32, 48, 96, 128],
  },
  manifest: ({ browser }) => ({
    name: 'BrowserBot - AI-Powered Browser Automation',
    description: 'Automate Tab Groups, Organize Bookmarks, Ask Tabs all with 3 AI Providers (OpenAI API, Ollama and built-in Chrome AI)',
    permissions: browser === 'firefox'
      ? ['tabs', 'tabGroups', 'storage', 'scripting', 'bookmarks', 'cookies', 'webRequest', 'webRequestBlocking']
      : ['tabs', 'tabGroups', 'storage', 'scripting', 'bookmarks', 'cookies', 'debugger', 'declarativeNetRequest', 'declarativeNetRequestWithHostAccess'],
    host_permissions: ['<all_urls>'],
    web_accessible_resources: [
      {
        resources: ['fonts/*', 'content-scripts/*', 'icon-alt.png', 'assets/*'],
        matches: ['<all_urls>'],
      },
    ],
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
    },
    ...(browser === 'firefox' ? {
      browser_specific_settings: {
        gecko: {
          id: 'browserbot@faisalbhuiyan.com',
          'data_collection_permissions': {
            'required': ['none']
          }
        }
      }
    } : {})
  })
});
